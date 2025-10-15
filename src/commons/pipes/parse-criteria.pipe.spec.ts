import { BadRequestException } from '@nestjs/common';
import { ParseCriteriaPipe } from './parse-criteria.pipe';

describe('ParseCriteriaPipe', () => {
  let pipe: ParseCriteriaPipe;

  beforeEach(() => {
    pipe = new ParseCriteriaPipe();
  });

  describe('Pagination parsing', () => {
    it('should use default values when no pagination params provided', () => {
      const result = pipe.transform({});
      
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should parse pagination[limit] and pagination[offset]', () => {
      const result = pipe.transform({
        'pagination[limit]': '20',
        'pagination[offset]': '40',
      });
      
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(40);
    });

    it('should throw error for invalid limit', () => {
      expect(() => {
        pipe.transform({ 'pagination[limit]': 'invalid' });
      }).toThrow(BadRequestException);
    });

    it('should throw error for negative limit', () => {
      expect(() => {
        pipe.transform({ 'pagination[limit]': '-10' });
      }).toThrow(BadRequestException);
    });

    it('should throw error for zero limit', () => {
      expect(() => {
        pipe.transform({ 'pagination[limit]': '0' });
      }).toThrow(BadRequestException);
    });

    it('should throw error for limit exceeding max', () => {
      expect(() => {
        pipe.transform({ 'pagination[limit]': '101' });
      }).toThrow(BadRequestException);
    });

    it('should throw error for invalid offset', () => {
      expect(() => {
        pipe.transform({ 'pagination[offset]': 'invalid' });
      }).toThrow(BadRequestException);
    });

    it('should throw error for negative offset', () => {
      expect(() => {
        pipe.transform({ 'pagination[offset]': '-5' });
      }).toThrow(BadRequestException);
    });

    it('should accept zero as valid offset', () => {
      const result = pipe.transform({ 'pagination[offset]': '0' });
      expect(result.offset).toBe(0);
    });
  });

  describe('Filter parsing', () => {
    it('should parse single filter', () => {
      const result = pipe.transform({
        'filter[stock]': '10',
      });
      
      expect(result.filter).toEqual({ stock: 10 });
    });

    it('should parse multiple filters', () => {
      const result = pipe.transform({
        'filter[stock]': '10',
        'filter[gender]': 'men',
      });
      
      expect(result.filter).toEqual({
        stock: 10,
        gender: 'men',
      });
    });

    it('should convert numeric strings to numbers', () => {
      const result = pipe.transform({
        'filter[stock]': '100',
        'filter[price]': '29.99',
      });
      
      expect(result.filter).toEqual({
        stock: 100,
        price: 29.99,
      });
    });

    it('should keep non-numeric strings as strings', () => {
      const result = pipe.transform({
        'filter[gender]': 'women',
        'filter[title]': 'shirt',
      });
      
      expect(result.filter).toEqual({
        gender: 'women',
        title: 'shirt',
      });
    });

    it('should not include filter property when no filters provided', () => {
      const result = pipe.transform({});
      
      expect(result.filter).toBeUndefined();
    });
  });

  describe('Sort parsing', () => {
    it('should parse single sort', () => {
      const result = pipe.transform({
        'sort[price]': 'asc',
      });
      
      expect(result.sort).toEqual({ price: 'asc' });
    });

    it('should parse multiple sorts', () => {
      const result = pipe.transform({
        'sort[price]': 'asc',
        'sort[stock]': 'desc',
      });
      
      expect(result.sort).toEqual({
        price: 'asc',
        stock: 'desc',
      });
    });

    it('should accept uppercase sort values', () => {
      const result = pipe.transform({
        'sort[price]': 'ASC',
        'sort[stock]': 'DESC',
      });
      
      expect(result.sort).toEqual({
        price: 'ASC',
        stock: 'DESC',
      });
    });

    it('should ignore invalid sort values', () => {
      const result = pipe.transform({
        'sort[price]': 'invalid',
      });
      
      expect(result.sort).toBeUndefined();
    });

    it('should not include sort property when no sorts provided', () => {
      const result = pipe.transform({});
      
      expect(result.sort).toBeUndefined();
    });
  });

  describe('Combined parsing', () => {
    it('should parse pagination, filters, and sorts together', () => {
      const result = pipe.transform({
        'pagination[limit]': '20',
        'pagination[offset]': '10',
        'filter[stock]': '5',
        'filter[gender]': 'men',
        'sort[price]': 'asc',
        'sort[stock]': 'desc',
      });
      
      expect(result).toEqual({
        limit: 20,
        offset: 10,
        filter: {
          stock: 5,
          gender: 'men',
        },
        sort: {
          price: 'asc',
          stock: 'desc',
        },
      });
    });

    it('should ignore non-matching query parameters', () => {
      const result = pipe.transform({
        'pagination[limit]': '20',
        'filter[stock]': '10',
        'randomParam': 'value',
        'another': 'test',
      });
      
      expect(result).toEqual({
        limit: 20,
        offset: 0,
        filter: { stock: 10 },
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty bracket values', () => {
      const result = pipe.transform({
        'filter[]': 'value',
        'sort[]': 'asc',
      });
      
      expect(result.filter).toBeUndefined();
      expect(result.sort).toBeUndefined();
    });

    it('should handle malformed brackets', () => {
      const result = pipe.transform({
        'filter[stock': '10',
        'filterstock]': '20',
      });
      
      expect(result.filter).toBeUndefined();
    });

    it('should handle numeric zero as filter value', () => {
      const result = pipe.transform({
        'filter[stock]': '0',
      });
      
      expect(result.filter).toEqual({ stock: 0 });
    });

    it('should handle negative numbers as filter values', () => {
      const result = pipe.transform({
        'filter[temperature]': '-10',
      });
      
      expect(result.filter).toEqual({ temperature: -10 });
    });
  });
});
