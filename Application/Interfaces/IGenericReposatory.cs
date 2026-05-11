using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IGenericReposatory<T>where T : class
    {
        T GetById(int id);
        Task insert(T entity);
        Task<List<T>> GetAll(); 
        Task update(T entity);
        Task delete(T entity);
        public IQueryable<T> GetQueryable();

    }
}
