using HibaVonal_03.Context;
using HibaVonal_03.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HibaVonal_03
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.AddDbContext<HibaVonalDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))); // Use SQL Server as the database provider, with the connection string from appsettings.json

            // we register the generic repository (IRepository<T> and Repository<T>) with the dependency injection container
            builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

            // we register the UnitOfWork (IUnitOfWork and UnitOfWork) with the dependency injection container
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

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
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
