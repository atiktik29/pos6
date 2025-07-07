import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useProducts } from '@/hooks/useProducts';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import RealtimeClock from '@/components/admin/RealtimeClock';
import CashierSelector from '@/components/admin/CashierSelector';
import { db } from '@/config/firebase';
import { toast } from '@/hooks/use-toast';
import { processPOSTransaction } from '@/services/posService';
import AdminLayout from '@/components/admin/AdminLayout';
import { Product } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { usePOSTransactions } from '@/hooks/usePOSTransactions';
import DailySalesView from '@/components/admin/DailySalesView';

// UI Components 
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Search, ShoppingCart, CreditCard, QrCode, RefreshCw, Clock, Calendar, DollarSign, Trash2,
  RefreshCw, Receipt, Printer, AlertOctagon, Download, XCircle, DollarSign, CheckCircle } from 'lucide-react';

// Cart item interface
interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

// Cashier interface
interface Cashier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const POSSystem = () => {
  // ... rest of the code ...
};

export default POSSystem;