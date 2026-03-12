'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { ArrowDown, ArrowUp, Lock } from 'lucide-react';

interface WalletData {
  balance: number;
  lockedEscrow: number;
  totalEarned: number;
  totalSpent: number;
}

interface Transaction {
  _id: string;
  amount: number;
  type: 'credit' | 'debit' | 'escrow_lock' | 'escrow_release';
  description: string;
  reference?: { title: string };
  createdAt: string;
}

export default function WalletPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchWallet = async () => {
      if (!token) return;

      try {
        const walletRes = await fetch(`${API_URL}/api/wallet`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const historyRes = await fetch(`${API_URL}/api/wallet/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWallet(walletData.wallet);
        }

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setTransactions(historyData.transactions);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load wallet',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [token, API_URL, toast]);

  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      });
      return;
    }

    // In a real implementation, this would integrate with Razorpay
    toast({
      title: 'Info',
      description: 'Payment integration coming soon. Contact support to add funds.',
      duration: 3000
    });
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'credit' || type === 'escrow_release') {
      return <ArrowDown className="w-4 h-4 text-green-500" />;
    }
    return <ArrowUp className="w-4 h-4 text-red-500" />;
  };

  const getTransactionColor = (type: string) => {
    if (type === 'credit' || type === 'escrow_release') {
      return 'text-green-600';
    }
    if (type === 'escrow_lock') {
      return 'text-yellow-600';
    }
    return 'text-red-600';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Spinner />
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <header className="border-b border-border/40 bg-background/95 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="grid gap-6 mb-8">
            {/* Wallet Balance */}
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Available Balance</p>
                  <p className="text-5xl font-bold text-primary">₹{wallet?.balance.toFixed(2)}</p>
                </div>
                <div className="flex gap-4 items-end justify-end">
                  <Button onClick={() => setShowAddFunds(!showAddFunds)}>
                    Add Funds
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="outline">Earn Money</Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Add Funds Form */}
            {showAddFunds && (
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Add Funds to Wallet</h3>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    className="flex-1 px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button onClick={handleAddFunds}>Add</Button>
                  <Button variant="outline" onClick={() => setShowAddFunds(false)}>
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <p className="text-muted-foreground text-sm mb-2">Total Earned</p>
                <p className="text-3xl font-bold text-green-600">₹{wallet?.totalEarned.toFixed(2)}</p>
              </Card>
              <Card className="p-6">
                <p className="text-muted-foreground text-sm mb-2">Total Spent</p>
                <p className="text-3xl font-bold text-red-600">₹{wallet?.totalSpent.toFixed(2)}</p>
              </Card>
              <Card className="p-6 border-yellow-200 bg-yellow-50">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-yellow-600" />
                  <p className="text-muted-foreground text-sm">Locked in Escrow</p>
                </div>
                <p className="text-3xl font-bold text-yellow-600">₹{wallet?.lockedEscrow.toFixed(2)}</p>
              </Card>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Transaction History</h2>
            {transactions.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No transactions yet</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {transactions.map(transaction => (
                  <Card key={transaction._id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getTransactionIcon(transaction.type)}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()} at{' '}
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'credit' || transaction.type === 'escrow_release' ? '+' : '-'}₹
                      {transaction.amount.toFixed(2)}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
