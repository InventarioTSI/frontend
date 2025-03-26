import React from "react";
import "./Pagination.css";

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  hasMoreData,
}) {
  // Calcular el número real de páginas
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Función para manejar el cambio a la página anterior
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Función para manejar el cambio a la página siguiente
  const handleNext = () => {
    if (currentPage < totalPages && hasMoreData) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination-container">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="previous-button"
      >
        Anterior
      </button>
      {/* Mostrar número de página actual */}
      <div className="page-number-display">
        Página <span className="current-page-number">{currentPage}</span> de{" "}
        <span className="total-pages-number">{totalPages}</span>
      </div>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages || !hasMoreData}
        className="next-button"
      >
        Siguiente
      </button>
    </div>
  );
}
