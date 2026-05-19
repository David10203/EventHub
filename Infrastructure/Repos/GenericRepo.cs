using Core.Interfaces;
using Infrastructure.DataBase;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repos
{
    public class GenericRepo<T>:IGenericReposatory<T> where T : class
    {
        private readonly AppDbContext _context;
        private readonly DbSet<T> dbset;
        public GenericRepo(AppDbContext context)
        {
            _context = context;
            dbset = context.Set<T>();
        }

        public async Task delete(T entity)
        {
            dbset.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task ClearCart(int usertId)
        {
            await _context.Carts
                .Where(t => t.UserId == usertId)
                .ExecuteDeleteAsync();
        }

        public  T GetById(int id)
        {
           return    dbset.Find(id);
             
        }

        public async Task<List<T>> GetAll()
        {
            return await dbset.ToListAsync();
        }

        public IQueryable<T> GetQueryable()
        {
            return dbset.AsQueryable();
        }

        public Task insert(T entity)
        {
            dbset.Add(entity);
           return _context.SaveChangesAsync(); 
        }

        public Task update(T entity)
        {
           dbset.Update(entity);
            return _context.SaveChangesAsync();
        }
    }
}
