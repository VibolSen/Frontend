import React from 'react';

// Single Resource Card
const ResourceCard = ({ resource, onResourceClick, onEditClick, onDeleteClick }) => {
  const { title, author, coverImage, department, publicationYear } = resource;

  const handleCardClick = () => onResourceClick(resource);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    onEditClick(resource);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    onDeleteClick(resource);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 cursor-pointer h-full"
      aria-label={`View details for ${title}`}
    >
      <div className="relative h-64 overflow-hidden bg-slate-100">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={coverImage || '/placeholder-book.png'}
          alt={`Cover for ${title}`}
          loading="lazy"
          onError={(e) => {e.target.src = 'https://placehold.co/400x600?text=No+Cover'}}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 gap-3">
          {onEditClick && (
            <button
              onClick={handleEditClick}
              className="text-white bg-slate-900/80 hover:bg-slate-900 backdrop-blur-sm rounded-full p-3 transition-transform duration-300 hover:scale-110 shadow-lg border border-white/10"
              aria-label={`Edit ${title}`}
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {onDeleteClick && (
            <button
              onClick={handleDeleteClick}
              className="text-white bg-red-600/80 hover:bg-red-600 backdrop-blur-sm rounded-full p-3 transition-transform duration-300 hover:scale-110 shadow-lg border border-white/10"
              aria-label={`Delete ${title}`}
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        {publicationYear && (
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded-md border border-white/10">
                {publicationYear}
            </div>
        )}
        {resource.fileUrl && (
             <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-md text-white p-1.5 rounded-md shadow-sm border border-white/10 opacity-90 group-hover:opacity-100 transition-opacity" title="Document Available">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
             </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-blue-600 transition-colors" title={title}>{title}</h3>
        <p className="text-sm text-slate-500 font-medium mb-4">{author || 'Unknown Author'}</p>
      </div>
    </div>
  );
};

// Grid to display multiple resources
const ELibraryGrid = ({ resources, onResourceClick, onEditClick, onDeleteClick }) => {
  if (!resources || resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100 text-center animate-fade-in">
        <div className="bg-slate-50 p-6 rounded-full mb-4">
            <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.22-8.242l10.44 4.99m-10.44-4.99l10.44 4.99M3 10.519l9-4.266 9 4.266" />
            </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No Resources Found</h3>
        <p className="mt-2 text-slate-500 max-w-sm">
          We couldn't find any resources matching your search. Try adjusting your filters or add a new resource.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 pb-10">
      {resources.map(resource => (
        <ResourceCard 
          key={resource.id} 
          resource={resource} 
          onResourceClick={onResourceClick} 
          onEditClick={onEditClick} 
          onDeleteClick={onDeleteClick} 
        />
      ))}
    </div>
  );
};

export default ELibraryGrid;
