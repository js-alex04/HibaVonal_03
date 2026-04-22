using AutoMapper;
using HibaVonal_03.Context;
using HibaVonal_03.Interfaces.Appliance;
using HibaVonal_03.Interfaces.Auth;
using HibaVonal_03.Interfaces.Fault;
using HibaVonal_03.Interfaces.Feedback;
using HibaVonal_03.Interfaces.Maintainer;
using HibaVonal_03.Interfaces.MaintainerSpecialisation;
using HibaVonal_03.Interfaces.Premise;
using HibaVonal_03.Interfaces.ToolOrder;
using HibaVonal_03.Interfaces.User;
using HibaVonal_03.Profiles;
using HibaVonal_03.Repositories;
using HibaVonal_03.Services;
using HibaVonal_03.Services.Appliance;
using HibaVonal_03.Services.Auth;
using HibaVonal_03.Services.Fault;
using HibaVonal_03.Services.Feedback;
using HibaVonal_03.Services.Maintainer;
using HibaVonal_03.Services.MaintainerSpecialisation;
using HibaVonal_03.Services.Premise;
using HibaVonal_03.Services.ToolOrder;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace HibaVonal_03
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers().AddJsonOptions(options =>
            {
                // enumok olvasható szöveggé alakítása
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            }); ;

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
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))); // Use SQL Server as the database provider, with the connection string from appsettings.

            // regisztráljuk az ApplianceService-t (IApplianceService és ApplianceService) a dependency injection konténerbe
            builder.Services.AddScoped<IApplianceService, ApplianceService>();

            // regisztráljuk az AuthService-t (IAuthService és AuthService) a dependency injection konténerbe
            builder.Services.AddScoped<IAuthService, AuthService>();

            // regisztráljuk a FaultService-t (IFaultService és FaultService) a dependency injection konténerbe
            builder.Services.AddScoped<IFaultService, FaultService>();

            // regisztráljuk a FeedbackService-t (IFeedbackService és FeedbackService) a dependency injection konténerbe
            builder.Services.AddScoped<IFeedbackService, FeedbackService>();

            // regisztráljuk a MaintainerService-t (IMaintainerService és MaintainerService) a dependency injection konténerbe
            builder.Services.AddScoped<IMaintainerService, MaintainerService>();

            // regisztráljuk a MaintainerSpecialisationService-t (IMaintainerSpecialisationService és MaintainerSpecialisationService) a dependency injection konténerbe
            builder.Services.AddScoped<IMaintainerSpecialisationService, MaintainerSpecialisationService>();

            // regisztráljuk a PremiseService-t (IPremiseService és PremiseService) a dependency injection konténerbe
            builder.Services.AddScoped<IPremiseService, PremiseService>();

            // regisztráljuk a ToolOrderService-t (IToolOrderService és ToolOrderService) a dependency injection konténerbe
            builder.Services.AddScoped<IToolOrderService, ToolOrderService>();

            // regisztráljuk a UserService-t (IUserService és UserService) a dependency injection konténerbe
            builder.Services.AddScoped<IUserService, UserService>();

            // regisztráljuk a generikus repository-t (IRepository<T> és Repository<T>) a dependency injection konténerbe
            builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

            // regisztráljuk a UnitOfWork-t (IUnitOfWork és UnitOfWork) a dependency injection konténerbe
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

            //Mapper registration
            builder.Services.AddAutoMapper(config =>
            {
                config.AddMaps(typeof(Program).Assembly);
            });

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
