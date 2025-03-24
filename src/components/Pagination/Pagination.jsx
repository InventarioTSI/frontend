// Componente de paginación que maneja la navegación entre las páginas de una lista de elementos.

import React from "react";
import "./Pagination.css";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Función para manejar el cambio a la página anterior
  const handlePrevious = () => {
    if (currentPage > 1) { // Asegura que no se navegue antes de la primera página
      onPageChange(currentPage - 1);
    }
  };

  // Función para manejar el cambio a la siguiente página
  const handleNext = () => {
    if (currentPage < totalPages) { // Asegura que no se navegue después de la última página
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
        disabled={currentPage === totalPages}
        className="next-button"
      >
        Siguiente
      </button>
    </div>
  );
}