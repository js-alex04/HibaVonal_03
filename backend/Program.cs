using AutoMapper;
using HibaVonal_03.Context;
using HibaVonal_03.DTOs;
using HibaVonal_03.Interfaces;
using HibaVonal_03.Profiles;
using HibaVonal_03.Repositories;
using HibaVonal_03.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;

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
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;

                options.JsonSerializerOptions.TypeInfoResolver = new DefaultJsonTypeInfoResolver
                {
                    Modifiers =
        {
            typeInfo =>
            {
                // Csak a UserResponseDto-ra és az abból származókra (Collegiate, Maintainer) alkalmazzuk
                if (typeInfo.Type == typeof(UserResponseDto) || typeInfo.Type.IsSubclassOf(typeof(UserResponseDto)))
                {
                    // 1. ELTÜNTETJÜK a polimorfizmust (ezzel kinyírjuk a $type mezőt)
                    typeInfo.PolymorphismOptions = null;

                    // 2. SORBA RENDEZZÜK a mezőket
                    // Kimentjük a meglévő mezőket, majd töröljük a listát
                    var props = typeInfo.Properties.ToList();
                    typeInfo.Properties.Clear();

                    // Definiálunk egy prioritási sorrendet (kisebb szám = előrébb kerül)
                    int GetOrder(string name) => name.ToLower() switch
                    {
                        "id" => 1,
                        "name" => 2,
                        "email" => 3,
                        "role" => 4,
                        _ => 10 // Minden más (extra mezők) a végére kerül
                    };

                    // Visszatöltjük a mezőket a megadott sorrendben
                    foreach (var prop in props.OrderBy(p => GetOrder(p.Name)))
                    {
                        typeInfo.Properties.Add(prop);
                    }
                }
            }
        }
                };
            });

            builder.Services.AddEndpointsApiExplorer(); // Ez segít a Swaggernek feltérképezni a végpontokat
            builder.Services.AddSwaggerGen();           // Ez generálja a Swagger dokumentációt

            // React frontend build folder configuration
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                {
                    policy.WithOrigins("http://localhost:3000") // frontend's port
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            builder.Services.AddDbContext<HibaVonalDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))); // Use SQL Server as the database provider, with the connection string from appsettings.

            // regisztráljuk az ApplianceService-t (IApplianceService és ApplianceService) a dependency injection konténerbe
            builder.Services.AddScoped<IApplianceService, ApplianceService>();

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
            app.UseCors("AllowReactApp");

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
