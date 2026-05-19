using Core.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.DataBase
{
    public class AppDbContext:DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Event> Events { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
     
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<UserEvent> UserEvents { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        public DbSet<Cart> Carts { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserEvent>()
    .HasKey(x => new { x.UserId, x.EventId });

            modelBuilder.Entity<Cart>()
.HasKey(x => new { x.UserId, x.EventId });

            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Role>().HasData(
               new Role
               {

                   Id = 1,
                   Name = "Admin",
                   
               },
               new Role
               {
                   Id = 2,
                   Name = "EventOrganizer",
                   

               },
               new Role
               {
                   Id = 3,
                   Name = "participant",
                  

               }
           );


            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    FirstName = "Admin",
                    LastName = "Admin",
                    Email = "Admin@gmail.com",
                    Password = "AQAAAAIAAYagAAAAEIimW0AULvCPFFKpH7E6YYTL1YIBuOysEWLjiC3AkCfZdGEzokZCJBxjmELF3sF0+Q==",
                    RoleId = 1
                },
                    new User
                    {
                        Id = 2,
                        FirstName = "User",
                        LastName = "User",
                        Email = "User@gmail.com",
                        Password = "AQAAAAIAAYagAAAAEIimW0AULvCPFFKpH7E6YYTL1YIBuOysEWLjiC3AkCfZdGEzokZCJBxjmELF3sF0+Q==",
                        RoleId = 3
                        
                    },
                    new User
                    {
                        Id = 3,
                        FirstName = "Organizer",
                        LastName = "Organizer",
                        Email = "Organizer@gmail.com",
                        Password = "AQAAAAIAAYagAAAAEIimW0AULvCPFFKpH7E6YYTL1YIBuOysEWLjiC3AkCfZdGEzokZCJBxjmELF3sF0+Q==",
                        RoleId = 2
                    }

            );
            modelBuilder.Entity<Category>().HasData(
                new Category {
                    Id = 1, 
                    Name = "Music" 
                },
                new Category
                {
                    Id = 2,
                    Name = "Sport"
                },
                new Category
                {
                    Id = 3,
                    Name = "Art"
                }

                );

            modelBuilder.Entity<Permission>().HasData(

                new Permission
                {
                    Id = 1,
                    Name = "Add",
                    
                },
                 new Permission
                 {
                     Id = 2,
                     Name = "Update",
                     
                 },
                 new Permission
                 {
                     Id = 3,
                     Name = "Delete",
                 }

                );

            modelBuilder.Entity("PermissionRole").HasData(
new { RolesId = 1, PermissionsId = 1 },
new { RolesId = 1, PermissionsId = 2 },
new { RolesId = 1, PermissionsId = 3 },
new { RolesId = 2, PermissionsId = 1 },
new { RolesId = 2, PermissionsId = 2 },
new { RolesId = 2, PermissionsId = 3 },
new { RolesId = 3, PermissionsId = 2 }

);


        }

    }
}
