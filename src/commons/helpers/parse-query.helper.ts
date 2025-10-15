// src/commons/helpers/parse-query.helper.ts

/**
 * Parsea un objeto plano con claves en formato 'filter[clave]' a un objeto plano de strings.
 * Solo procesa claves que comiencen con 'filter['.
 * Convierte valores numéricos a number cuando es posible.
 * 
 * @example
 * // Retorna: { stock: 80, name: 'zapatos' }
 * filter({ 'filter[stock]': '80', 'filter[name]': 'zapatos' });
 */
export function filter(query: Record<string, string | number>): Record<string, string | number> {
    const result: Record<string, string | number> = {};
  
    for (const [key, value] of Object.entries(query)) {
      // Solo procesar claves que comiencen con 'filter['
      if (!key.startsWith('filter[') || !key.endsWith(']')) {
        continue;
      }
  
      // Extraer el nombre del filtro (lo que está entre corchetes)
      const filterName = key.slice(7, -1); // Elimina 'filter[' al inicio y ']' al final
  
      // Si el nombre del filtro está vacío o ya existe, lo saltamos
      if (!filterName || result[filterName] !== undefined) {
        continue;
      }
  
      // Convertir a número si es posible (solo si es string)
      if (typeof value === 'string') {
        result[filterName] = isNumeric(value) ? Number(value) : value;
      } else {
        result[filterName] = value;
      }
    }
  
    return result;
  }
  
  /**
   * Verifica si un string puede ser convertido a número
   */
  function isNumeric(value: string): boolean {
    return !isNaN(Number(value)) && 
           !isNaN(parseFloat(value)) && 
           isFinite(Number(value));
  }