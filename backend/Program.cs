using HibaVonal_03.Context;
using HibaVonal_03.Interfaces.Fault;
using HibaVonal_03.Interfaces.Feedback;
using HibaVonal_03.Profiles;
using HibaVonal_03.Repositories;
using HibaVonal_03.Services.Fault;
using HibaVonal_03.Services.Feedback;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Operations;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace HibaVonal_03
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();

            builder.Services.AddEndpointsApiExplorer(); // Ez segít a Swaggernek feltérképezni a végpontokat
            builder.Services.AddSwaggerGen();           // Ez generálja a Swagger dokumentációt

            // React frontend build folder configuration
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:3000") // frontend's port
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            builder.Services.AddDbContext<HibaVonalDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))); // Use SQL Server as the database provider, with the connection string from appsettings.json

            // we register the generic repository (IRepository<T> and Repository<T>) with the dependency injection container
            builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

            // we register the UnitOfWork (IUnitOfWork and UnitOfWork) with the dependency injection container
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

            //we register the services (I...Service and ...Service) with the dependency injection container
            builder.Services.AddScoped<IFaultService, FaultService>();
            builder.Services.AddScoped<IFeedbackService, FeedbackService>();

            //Mapper registration
            builder.Services.AddAutoMapper(typeof(FaultProfile));

            var app = builder.Build();

            //AI által generált kód: Adatbázis feltöltése (seeding) a program indításakor
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    // Lekérjük az adatbázis kontextust
                    var context = services.GetRequiredService<HibaVonalDbContext>();
                    // Lefuttatjuk a feltöltést
                    HibaVonal_03.Data.DbInitializer.Initialize(context);
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "Hiba történt az adatbázis feltöltése (seeding) során.");
                }
            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();   // Létrehozza a JSON fájlt
                app.UseSwaggerUI(); // Létrehozza a gyönyörű grafikus weboldalt
            }

            app.UseHttpsRedirection();

            // Enable CORS for the React frontend
            app.UseCors("AllowReactFrontend");

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
