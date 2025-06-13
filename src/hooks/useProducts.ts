import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_trending: boolean;
  rating: number;
  review_count: number;
  category: {
    id: string;
    name: string;
  } | null;
  images: Array<{
    id: string;
    image_url: string;
    alt_text: string | null;
    is_primary: boolean;
  }>;
  variants: Array<{
    id: string;
    size: string;
    color: string;
    stock_quantity: number;
  }>;
}

export const useProducts = (filters?: {
  category?: string;
  featured?: boolean;
  trending?: boolean;
  search?: string;
  priceRange?: [number, number];
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          original_price,
          sku,
          stock_quantity,
          is_active,
          is_featured,
          is_trending,
          rating,
          review_count,
          categories (
            id,
            name
          ),
          product_images (
            id,
            image_url,
            alt_text,
            is_primary
          ),
          product_variants (
            id,
            size,
            color,
            stock_quantity
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', filters.category)
          .single();
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      if (filters?.trending) {
        query = query.eq('is_trending', true);
      }

      if (filters?.priceRange) {
        query = query
          .gte('price', filters.priceRange[0])
          .lte('price', filters.priceRange[1]);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
        return;
      }

      let filteredData = data || [];

      // Apply search filter
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
        );
      }

      const formattedProducts: Product[] = filteredData.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.original_price,
        sku: product.sku,
        stock_quantity: product.stock_quantity,
        is_active: product.is_active,
        is_featured: product.is_featured,
        is_trending: product.is_trending,
        rating: product.rating,
        review_count: product.review_count,
        category: product.categories,
        images: product.product_images.sort((a: any, b: any) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return 0;
        }),
        variants: product.product_variants,
      }));

      setProducts(formattedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          original_price,
          sku,
          stock_quantity,
          is_active,
          is_featured,
          is_trending,
          rating,
          review_count,
          categories (
            id,
            name
          ),
          product_images (
            id,
            image_url,
            alt_text,
            is_primary
          ),
          product_variants (
            id,
            size,
            color,
            stock_quantity
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      if (data) {
        const formattedProduct: Product = {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          original_price: data.original_price,
          sku: data.sku,
          stock_quantity: data.stock_quantity,
          is_active: data.is_active,
          is_featured: data.is_featured,
          is_trending: data.is_trending,
          rating: data.rating,
          review_count: data.review_count,
          category: data.categories,
          images: data.product_images.sort((a: any, b: any) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return 0;
          }),
          variants: data.product_variants,
        };

        setProduct(formattedProduct);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { product, loading, error, refetch: fetchProduct };
};