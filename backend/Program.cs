using AutoMapper;
using HibaVonal_03.Context;
using HibaVonal_03.DTOs;
using HibaVonal_03.Interfaces;
using HibaVonal_03.Repositories;
using HibaVonal_03.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;

namespace HibaVonal_03
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // JWT és adatbázis beállítások beolvasása
            var jwtSettings = builder.Configuration.GetSection("JwtSettings");
            var secretKey = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

            builder.Services.AddDbContext<HibaVonalDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Alapvető szolgáltatások (Mapper, DB) regisztrálása
            builder.Services.AddAutoMapper(config =>
            {
                config.AddMaps(typeof(Program).Assembly);
            });
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
            builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

            // Üzleti logika (Services) regisztrálása
            builder.Services.AddScoped<IApplianceService, ApplianceService>();
            builder.Services.AddScoped<IFaultService, FaultService>();
            builder.Services.AddScoped<IFeedbackService, FeedbackService>();
            builder.Services.AddScoped<IMaintainerService, MaintainerService>();
            builder.Services.AddScoped<IMaintainerSpecialisationService, MaintainerSpecialisationService>();
            builder.Services.AddScoped<IPremiseService, PremiseService>();
            builder.Services.AddScoped<IToolOrderService, ToolOrderService>();
            builder.Services.AddScoped<IUserService, UserService>();

            // Controllerek és JSON szerializációs szabályok
            builder.Services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;

            options.JsonSerializerOptions.TypeInfoResolver = new DefaultJsonTypeInfoResolver
                {
                    Modifiers =
                    {
                        typeInfo =>
                        {
                            if (typeInfo.Type == typeof(UserResponseDto) || typeInfo.Type.IsSubclassOf(typeof(UserResponseDto)))
                            {
                                typeInfo.PolymorphismOptions = null;

                                var props = typeInfo.Properties.ToList();
                                typeInfo.Properties.Clear();

                                int GetOrder(string name) => name.ToLower() switch
                                {
                                    "id" => 1,
                                    "name" => 2,
                                    "email" => 3,
                                    "role" => 4,
                                    _ => 10
                                };

                                foreach (var prop in props.OrderBy(p => GetOrder(p.Name)))
                                {
                                    typeInfo.Properties.Add(prop);
                                }
                            }
                        }
                    }
                };
            });

            // CORS beállítás a React frontendhez
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                {
                    policy.WithOrigins("http://localhost:3000")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            // Hitelesítés (JWT) konfigurálása
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(secretKey),
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwtSettings["Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

            // Swagger konfigurálása a JWT támogatással
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Másold be a JWT tokent ide."
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new List<string>()
                    }
                });
            });

            var app = builder.Build();

            // Adatbázis inicializálása (Seeding)
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<HibaVonalDbContext>();
                    context.Database.Migrate();
                    Data.DbInitializer.Seed(context);
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "Hiba történt az adatbázis feltöltése (seeding) során.");
                }
            }

            // HTTP Request Pipeline (Middleware-ek) beállítása
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowReactApp");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}