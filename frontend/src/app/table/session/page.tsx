"use client";

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowDown,
  MapPin,
  Instagram,
  Facebook,
  Clock,
  X,
  CalendarDays,
  Check,
  Star,
  Quote,
  Music,
  PartyPopper,
  Plus,
  CreditCard,
  AlertCircle,
  Receipt,
  Bell,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, addDays, startOfToday } from "date-fns";
import { useSessionStore, selectOrdersTotal, selectIsSessionActive, selectCartItemCount } from "@/lib/session-store";
import { startSession as apiStartSession, getSessionOrders, getSessionCart, addToCart as apiAddToCart, updateCartItemQuantity, removeFromCart as apiRemoveFromCart, findSessionByCode } from "@/lib/api";
import { JoinSessionModal } from "@/components/join-session-modal";
import { CartDrawer, CartButton } from "@/components/cart-drawer";
import { PaymentModal } from "@/components/payment-modal";
import { SessionBanner } from "@/components/session-banner";
import { VISUAL_MENU } from "@/lib/menu-data";
import { OrderHistoryDrawer } from "@/components/order-history-drawer";

const REVIEWS = [
  {
    name: "Elena R.",
    text: "The atmosphere is unmatched in Stuttgart. Best cocktails I've ever had.",
    rating: 5,
    date: "2 days ago"
  },
  {
    name: "Markus W.",
    text: "Perfect spot for a date night. The truffle fries are mandatory.",
    rating: 5,
    date: "1 week ago"
  },
  {
    name: "Sarah J.",
    text: "Music was incredible. A true hidden gem.",
    rating: 5,
    date: "3 weeks ago"
  }
];

const UPCOMING_EVENTS = [
  {
    title: "Jazz & Gin",
    date: "This Thursday",
    desc: "Live jazz trio accompanying our signature gin tasting flight.",
    icon: <Music className="h-5 w-5 text-amber-500" />
  },
  {
    title: "Midnight Masquerade",
    date: "Oct 31st",
    desc: "Our annual Halloween gala. Black tie & masks required.",
    icon: <PartyPopper className="h-5 w-5 text-amber-500" />
  }
]

// ============================================
// COMPONENTS
// ============================================

function ReservationDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState(startOfToday());
  const [time, setTime] = useState("");

  const today = startOfToday();
  const dates = Array.from({ length: 5 }).map((_, i) => addDays(today, i));
  const times = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];

  useEffect(() => {
    if (!isOpen) setTimeout(() => setStep(0), 300);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-serif tracking-wider text-amber-50">Reservations</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 block">Party Size</label>
                      <div className="grid grid-cols-4 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                          <button
                            key={n}
                            onClick={() => setGuests(n)}
                            className={cn(
                              "aspect-square rounded-xl border flex items-center justify-center text-lg font-bold transition-all",
                              guests === n ? "bg-amber-500 border-amber-500 text-black" : "border-white/10 text-white/60 hover:border-white/30 hover:bg-white/5"
                            )}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 block">Date</label>
                      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {dates.map((d, i) => (
                          <button
                            key={i}
                            onClick={() => setDate(d)}
                            className={cn(
                              "min-w-[80px] p-3 rounded-xl border flex flex-col items-center gap-1 transition-all",
                              format(date, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd') ? "bg-amber-500 border-amber-500 text-black" : "border-white/10 text-white/60 hover:border-white/30 hover:bg-white/5"
                            )}
                          >
                            <span className="text-xs opacity-70">{format(d, 'EEE')}</span>
                            <span className="text-lg font-bold">{format(d, 'd')}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 block">Time</label>
                      <div className="grid grid-cols-3 gap-3">
                        {times.map(t => (
                          <button
                            key={t}
                            onClick={() => setTime(t)}
                            className={cn(
                              "py-3 rounded-lg border text-sm font-bold transition-all",
                              time === t ? "bg-white text-black border-white" : "border-white/10 text-white/60 hover:border-white/30 hover:bg-white/5"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 pt-10 text-center"
                  >
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="h-10 w-10 text-amber-500" />
                    </div>
                    <h3 className="text-2xl font-serif text-white">Request Sent</h3>
                    <p className="text-white/60">
                      We have received your request for <strong className="text-white">{guests} guests</strong> on <strong className="text-white">{format(date, 'MMM do')}</strong> at <strong className="text-white">{time}</strong>.
                    </p>
                    <p className="text-sm text-white/40">You will receive a confirmation SMS shortly.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="p-6 border-t border-white/5 bg-[#0a0a0a]">
              {step === 0 ? (
                <Button
                  className="w-full h-14 text-lg font-bold bg-amber-500 text-black hover:bg-amber-400 rounded-none uppercase tracking-widest"
                  disabled={!time}
                  onClick={() => setStep(1)}
                >
                  Find Table
                </Button>
              ) : (
                <Button
                  className="w-full h-14 text-lg font-bold bg-white/10 text-white hover:bg-white/20 rounded-none uppercase tracking-widest"
                  onClick={onClose}
                >
                  Close
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Wrapper component that uses useSearchParams
function TableSessionPageContent() {
  const { scrollYProgress } = useScroll();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

  // Join Session State
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const [sessionError, setSessionError] = useState<string | null>(null);
  const containerRef = useRef(null);
  const initSessionRef = useRef<string | null>(null);
  const searchParams = useSearchParams();

  // Session store
  const { session, setSession, setTableInfo, orders, syncOrders, syncCart } = useSessionStore();
  const isSessionActive = useSessionStore(selectIsSessionActive);
  const ordersTotal = useSessionStore(selectOrdersTotal);
  const cartItemCount = useSessionStore(selectCartItemCount);

  // Start session on mount if tableId is in URL
  useEffect(() => {
    const tableId = searchParams.get('tableId');
    const codeFromUrl = searchParams.get('code'); // Optional now

    if (tableId && !session) {
      // Prevent double-initialization in React Strict Mode
      if (initSessionRef.current === tableId) return;
      initSessionRef.current = tableId;
      setTableInfo(parseInt(tableId), codeFromUrl || '');

      // Check localStorage for previously used code for this table
      const storedCode = localStorage.getItem(`table_${tableId}_session_code`);
      const codeToUse = codeFromUrl || storedCode;

      // Attempt to start/join session
      // If code is present, use it. If not, try to start new (or detect need for code)
      apiStartSession(parseInt(tableId), codeToUse)
        .then((newSession) => {
          setSession(newSession);
          setSessionError(null);

          // Store the session code in localStorage for future use
          if (newSession.sessionCode) {
            localStorage.setItem(`table_${tableId}_session_code`, newSession.sessionCode);
          }
        })
        .catch((err) => {
          if (err.message === 'AUTH_REQUIRED') {
            // Clear stored code if it's invalid
            if (storedCode) {
              localStorage.removeItem(`table_${tableId}_session_code`);
            }
            setIsJoinModalOpen(true);
          } else {
            setSessionError(err.message || 'Failed to start session. Please scan the QR code again.');
          }
        });
    }
  }, [searchParams, session, setSession, setTableInfo]);

  const handleJoinSession = async (code: string) => {
    const tableId = searchParams.get('tableId');

    // Case 1: Searching for a session by code (no table ID yet)
    if (!tableId) {
      setIsJoining(true);
      setJoinError(null);
      try {
        const foundSession = await findSessionByCode(code);
        // Correctly redirect using window.location to ensure full reload handling
        window.location.href = `/table/session?tableId=${foundSession.tableId}&code=${code}`;
      } catch (err: any) {
        setJoinError('Session not found. Please check the code.');
        setIsJoining(false);
      }
      return;
    }

    // Case 2: Joining a specific table (table ID present)
    setIsJoining(true);
    setJoinError(null);

    try {
      const newSession = await apiStartSession(parseInt(tableId), code);
      setSession(newSession);
      setIsJoinModalOpen(false);

      // Store the successful code in localStorage
      localStorage.setItem(`table_${tableId}_session_code`, code);
    } catch (err: any) {
      if (err.message === 'AUTH_REQUIRED' || err.message === 'Invalid table code') {
        setJoinError('Incorrect code. Please ask your table for the 4-digit code.');
      } else {
        setJoinError('Failed to join session. Please try again.');
      }
    } finally {
      setIsJoining(false);
    }
  };

  // Fetch orders once when session loads
  useEffect(() => {
    if (!session?.id) return;
    getSessionOrders(session.id)
      .then(syncOrders)
      .catch(err => console.error('Failed to fetch orders:', err));
  }, [session?.id, syncOrders]);

  // Sync session data (Cart & Orders)
  useEffect(() => {
    if (!session?.id) return;

    const syncData = async () => {
      try {
        // We must poll orders to check for "SERVED" status to enable payment
        const [dbCart, dbOrders] = await Promise.all([
          getSessionCart(session.id),
          getSessionOrders(session.id)
        ]);

        syncCart(dbCart);
        syncOrders(dbOrders);
      } catch (err) {
        console.error('Failed to sync session data:', err);
      }
    };

    // Initial sync
    syncData();

    // Poll every 3 seconds
    const interval = setInterval(syncData, 3000);

    return () => clearInterval(interval);
  }, [session?.id, syncCart, syncOrders]);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleAddToCart = async (item: typeof VISUAL_MENU[0]) => {
    if (!isSessionActive) {
      setSessionError('Please scan the QR code at your table to start ordering.');
      return;
    }

    if (!session) {
      setIsJoinModalOpen(true);
      return;
    }

    try {
      await apiAddToCart(session.id, item.id, item.name, item.price, item.image);
      const dbCart = await getSessionCart(session.id);
      syncCart(dbCart);
      setIsCartOpen(true);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      // alert("Failed to add item to cart. Please try again.");
    }
  };

  const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
    if (!session) return;
    try {
      if (quantity <= 0) {
        await apiRemoveFromCart(cartItemId);
      } else {
        await updateCartItemQuantity(cartItemId, quantity);
      }
      const dbCart = await getSessionCart(session.id);
      syncCart(dbCart);
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const handleRemoveFromCart = async (cartItemId: number) => {
    if (!session) return;
    try {
      await apiRemoveFromCart(cartItemId);
      const dbCart = await getSessionCart(session.id);
      syncCart(dbCart);
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  };

  return (
    <main ref={containerRef} className="relative bg-black text-white selection:bg-amber-500/30">
      {/* Session Banner */}
      {isSessionActive && <SessionBanner />}

      <JoinSessionModal
        isOpen={isJoinModalOpen}
        onJoin={handleJoinSession}
        isLoading={isJoining}
        error={joinError}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveFromCart={handleRemoveFromCart}
        onOrderPlaced={() => setIsOrderHistoryOpen(true)}
      />

      <OrderHistoryDrawer
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
      />

      {/* Payment Modal */}
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />

      <ReservationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-amber-500 origin-left z-50" style={{ scaleX }} />

      {/* Call Waiter Button - Bottom Left */}
      {isSessionActive && (
        <div className="fixed bottom-8 left-8 z-30">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-sm border border-white/10 shadow-lg"
            onClick={() => alert("A waiter has been notified and will be with you shortly.")}
          >
            <Bell className="h-6 w-6" />
          </motion.button>
        </div>
      )}

      {/* Floating Action Buttons - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-30 flex flex-row gap-4 items-end">

        {/* Cart Button - Show if items in cart */}
        {cartItemCount > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="bg-neutral-800 text-white p-4 rounded-full shadow-lg border border-white/10 hover:bg-neutral-700 relative"
          >
            <ShoppingBag className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-black rounded-full flex items-center justify-center text-xs font-bold shadow-lg border border-black/50">
              {cartItemCount}
            </div>
          </motion.button>
        )}

        {/* View Orders Button */}
        {isSessionActive && orders.length > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setIsOrderHistoryOpen(true)}
            className="bg-neutral-800 text-white p-4 rounded-full shadow-lg border border-white/10 hover:bg-neutral-700"
          >
            <Receipt className="h-6 w-6" />
          </motion.button>
        )}

        {/* Pay Button - only show when ALL orders are SERVED */}
        {isSessionActive && orders.length > 0 && orders.every(o => o.status === 'SERVED') && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setIsPaymentOpen(true)}
            className="bg-emerald-500 text-white px-6 py-4 font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 hover:bg-emerald-400 transition-all rounded-full flex items-center gap-3"
          >
            <CreditCard className="h-5 w-5" />
            Pay €{ordersTotal.toFixed(2)}
          </motion.button>
        )}

        {/* Reserve Table Button - only show if no active session */}
        {!isSessionActive && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={() => setIsDrawerOpen(true)}
            className="bg-amber-500 text-black px-8 py-4 font-bold uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 hover:bg-amber-400 transition-all rounded-full flex items-center gap-3 backdrop-blur-sm"
          >
            <CalendarDays className="h-5 w-5" />
            Reserve Table
          </motion.button>
        )}

        {/* Join by Code Button - only show if no active session AND no tableId */}
        {!isSessionActive && !searchParams.get('tableId') && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
            onClick={() => setIsJoinModalOpen(true)}
            className="bg-neutral-800 text-white px-8 py-4 font-bold uppercase tracking-widest shadow-lg border border-white/10 hover:bg-neutral-700 transition-all rounded-full flex items-center gap-3"
          >
            Enter Code
          </motion.button>
        )}
      </div>

      {/* Session Error Toast */}
      <AnimatePresence>
        {sessionError && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 max-w-md"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{sessionError}</p>
            <button onClick={() => setSessionError(null)} className="ml-2 p-1 hover:bg-white/10 rounded">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 text-center space-y-6 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <p className="text-amber-500 uppercase tracking-[0.5em] text-sm md:text-base mb-4 font-medium">Stuttgart</p>
            <h1 className="text-6xl md:text-9xl font-serif font-bold text-white mb-6 tracking-tight">
              Midnight<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">Lounge</span>
            </h1>
            <p className="max-w-md mx-auto text-white/70 text-lg md:text-xl font-light italic">
              "Where time stops and the night begins."
            </p>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/30 animate-bounce"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <ArrowDown className="h-6 w-6" />
        </motion.div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-32 px-6 bg-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-serif text-white mb-6">Crafted for the <span className="text-amber-500">Connoisseur</span></h2>
            <div className="w-20 h-1 bg-amber-500 mb-8" />
            <p className="text-white/60 text-lg leading-relaxed mb-6">
              Located in the heart of Stuttgart, The Midnight Lounge is an homage to the golden age of cocktails.
              Every pour is a performance, every glass a masterpiece.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-white/40 uppercase tracking-wider">Hours</p>
                  <p className="text-white font-serif">18:00 - 03:00</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-white/40 uppercase tracking-wider">Location</p>
                  <p className="text-white font-serif">Königstraße 12</p>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="relative h-[600px] w-full bg-neutral-900 rounded-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-700" />
          </motion.div>
        </div>
      </section>

      {/* VISUAL MENU GRID */}
      <section className="py-32 px-6 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-white mb-4">Signature Serves</h2>
            <p className="text-white/50">A sensory journey through taste and aroma</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {VISUAL_MENU.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => handleAddToCart(item)}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Add to Cart Button Overlay */}
                <motion.div
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <Plus className="h-6 w-6 text-black" />
                  </div>
                </motion.div>

                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <span className="inline-block px-3 py-1 bg-amber-500 text-black text-xs font-bold uppercase tracking-wider mb-3 rounded-full">
                    {item.category}
                  </span>
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-2xl font-serif text-white">{item.name}</h3>
                    <span className="text-xl font-bold text-amber-500">{item.priceDisplay}</span>
                  </div>
                  <p className="text-white/70 line-clamp-2 group-hover:text-white transition-colors">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-24 bg-neutral-900 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <h2 className="text-3xl font-serif text-white text-center">The Vibe</h2>
        </div>

        {/* Infinite Scroll Marquee Effect (simulated with standard grid for now) */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-black/40 p-8 rounded-2xl border border-white/5 backdrop-blur-sm"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />)}
              </div>
              <Quote className="h-8 w-8 text-white/10 mb-4" />
              <p className="text-white/80 italic mb-6">"{review.text}"</p>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-white">{review.name}</span>
                <span className="text-white/30">{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="py-32 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-serif text-white">Upcoming Events</h2>
            <Button variant="link" className="text-amber-500 hover:text-amber-400">View Calendar</Button>
          </div>

          <div className="space-y-4">
            {UPCOMING_EVENTS.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border border-white/10 hover:border-amber-500/30 hover:bg-white/5 transition-all"
              >
                <div className="w-16 h-16 bg-neutral-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {event.icon}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-500 transition-colors">{event.title}</h3>
                  <p className="text-white/50">{event.desc}</p>
                </div>
                <div className="px-6 py-2 rounded-full border border-white/10 text-sm font-mono text-amber-200">
                  {event.date}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-6 bg-neutral-950 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
            <h2 className="text-2xl font-serif text-white mb-2">Midnight Lounge</h2>
            <p className="text-white/40 text-sm">© 2026. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Main export with Suspense boundary for useSearchParams
export default function TableSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <TableSessionPageContent />
    </Suspense>
  );
}
