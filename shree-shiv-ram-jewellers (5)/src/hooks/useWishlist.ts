import { useState, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

export function useWishlist() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);

  const fetchWishlist = async () => {
    if (!user) return;
    const res = await fetch(`/api/wishlist/${user.id}`);
    const data = await res.json();
    setWishlist(data);
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId: number) => {
    if (!user) return;
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, productId }),
    });
    fetchWishlist();
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(p => p.id === productId);
  };

  return { wishlist, toggleWishlist, isInWishlist };
}
