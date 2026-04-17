"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/lib/authContext";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, ArrowDown, ArrowUp, Lock } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";
import CountUp from "react-countup";

interface WalletData {
  balance: number;
  lockedEscrow: number;
  totalEarned: number;
  totalSpent: number;
}

interface Transaction {
  _id: string;
  amount: number;
  type: "credit" | "debit" | "escrow_lock" | "escrow_release";
  description: string;
  reference?: { title: string };
  createdAt: string;
}

export default function WalletPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const isInitialLoading = loading && !wallet;

  useEffect(() => {
    const fetchWallet = async () => {
      if (!token) return;

      try {
        const walletRes = await fetch(`${API_URL}/api/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const historyRes = await fetch(`${API_URL}/api/wallet/history`, {
          headers: { Authorization: `Bearer ${token}` },
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
          title: "Error",
          description: "Failed to load wallet",
          variant: "destructive",
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
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, this would integrate with Razorpay
    toast({
      title: "Info",
      description:
        "Payment integration coming soon. Contact support to add funds.",
      duration: 3000,
    });
  };

  const getTransactionIcon = (type: string) => {
    if (type === "credit" || type === "escrow_release") {
      return <ArrowDown className="w-4 h-4 text-green-500" />;
    }
    return <ArrowUp className="w-4 h-4 text-red-500" />;
  };

  const getTransactionColor = (type: string) => {
    if (type === "credit" || type === "escrow_release") {
      return "text-green-600";
    }
    if (type === "escrow_lock") {
      return "text-yellow-600";
    }
    return "text-red-600";
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-transparent text-white">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-100px] left-[20%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-100px] right-[20%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full" />
        </div>{" "}
        <Header title="Wallet" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-8 max-w-4xl"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 mb-8"
          >
            {" "}
            {/* Wallet Balance */}
            <motion.div variants={itemVariants}>
              <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                {" "}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-white/60 text-sm mb-2">
                      {" "}
                      Available Balance
                    </p>
                    <p className="text-5xl font-bold text-primary text-white">
                      ₹
                      <CountUp
                        end={wallet?.balance || 0}
                        duration={1.2}
                        decimals={2}
                      />{" "}
                    </p>
                  </div>
                  <div className="flex gap-4 items-end justify-end">
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/30"
                      onClick={() => setShowAddFunds(!showAddFunds)}
                    >
                      Add Funds
                    </Button>
                    <Link href="/dashboard">
                      <Button
                        className="border-white/20 text-white hover:bg-white/10"
                        variant="outline"
                      >
                        Earn Money
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
            {/* Add Funds Form */}
            {showAddFunds && (
              <motion.div variants={itemVariants}>
                <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-xl">
                  {" "}
                  <h3 className="font-semibold text-white mb-4">
                    Add Funds to Wallet
                  </h3>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      placeholder="Amount (₹)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <Button
                      className="border-white/20 text-white hover:bg-white/10"
                      variant="outline"
                      onClick={handleAddFunds}
                    >
                      Add
                    </Button>

                    <Button
                      variant="destructive"
                      className="px-4 "
                      onClick={() => setShowAddFunds(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div variants={itemVariants}>
                <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-xl">
                  {" "}
                  <p className="text-white/60 text-sm mb-2"> Total Earned</p>
                  <p className="text-3xl font-bold text-green-600">
                    ₹{wallet?.totalEarned.toFixed(2)}
                  </p>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-xl">
                  {" "}
                  <p className="text-white/60 text-sm mb-2"> Total Spent</p>
                  <p className="text-3xl font-bold text-red-600">
                    ₹{wallet?.totalSpent.toFixed(2)}
                  </p>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="p-6 bg-yellow-500/10 border-yellow-400/30 backdrop-blur-xl">
                  {" "}
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-yellow-600" />
                    <p className="text-white/60 text-sm mb-2">
                      {" "}
                      Locked in Escrow
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">
                    ₹{wallet?.lockedEscrow.toFixed(2)}
                  </p>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Transaction History */}
          <div>
            <h2 className="text-2xl font-bold text-white text-foreground mb-6">
              Transaction History
            </h2>
            {transactions.length === 0 ? (
              <motion.div variants={itemVariants}>
                <Card className="p-8 text-center bg-white/5 border-white/10">
                  {" "}
                  <div className="flex flex-col items-center gap-3 text-white/60">
                    <Lock className="w-8 h-8 opacity-50" />
                    <p>No transactions yet</p>
                  </div>{" "}
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <motion.div key={transaction._id} variants={itemVariants}>
                    <Card className="p-4 flex items-center justify-between bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 rounded-full bg-white/10">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white text-foreground">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              transaction.createdAt,
                            ).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(
                              transaction.createdAt,
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}
                      >
                        {transaction.type === "credit" ||
                        transaction.type === "escrow_release"
                          ? "+"
                          : "-"}
                        ₹{transaction.amount.toFixed(2)}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </ProtectedRoute>
  );
}
