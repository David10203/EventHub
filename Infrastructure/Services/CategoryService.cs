using Application.DTOs;
using Application.Interfaces.Services;
using AutoMapper;
using Core.Models;
using Infrastructure.Repos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class CategoryService : ICategoryService
    {
        private GenericRepo<Category> _CategoryRepo;
        private readonly IMapper _Mapper;
        public CategoryService( GenericRepo<Category> CategoryRepo, IMapper mapper)
        {
            _Mapper = mapper;
            _CategoryRepo = CategoryRepo;
            
        }
      
        public async Task<List<CategoryDTOResponse>> GetCategories()
        {
            var categories= await _CategoryRepo.GetAll();
            var mapped= _Mapper.Map<List<CategoryDTOResponse>>(categories);
            return mapped;
        }
    }
}
