import { useEffect, useState } from "react";
import API from "../api/api";

export default function Settlement({ groupId, refresh }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [myId, setMyId] = useState("");
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMe();
    fetchBalance();
  }, []);

  useEffect(() => {
    if (groupId) fetchSettlement();
  }, [groupId]);

  const fetchMe = async () => {
    const res = await API.get("/user/me");
    setMyId(res.data.userId);
  };

  const fetchBalance = async () => {
    const res = await API.get("/wallet/balance");
    setBalance(res.data.balance);
  };

  const fetchSettlement = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/expense/settle/${groupId}`);
      setData(res.data.settlements || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (toUserId: string, amount: number) => {
    setError("");

    if (balance < amount) {
      setError("❌ Not enough balance to pay");
      return;
    }

    try {
      await API.post("/expense/settle-up", {
        toUserId,
        amount,
        groupId
      });

      fetchSettlement();
      fetchBalance();
      refresh?.();

    } catch (err: any) {
      setError(err.response?.data?.error || "Payment failed");
    }
  };

  return (
    <div className="glass card-animate p-6">
      <h2 className="font-bold mb-3">Settlement</h2>

      {error && (
        <div className="bg-red-500/20 border border-red-400/40 text-red-700 p-2 mb-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-600">All settled 🎉</p>
      ) : (
        data.map((s: any, i: number) => {
          const fromId = s.from?._id || s.from;
          const toId = s.to?._id || s.to;

          const fromName = s.from?.name || "User";
          const toName = s.to?.name || "User";

          const iOwe = fromId === myId;
          const iGet = toId === myId;

          return (
            <div key={i} className="flex justify-between items-center py-2 border-b border-white/20">

              <span>
                {iOwe && (
                  <span className="text-red-600">
                    You owe {toName} ₹{s.amount}
                  </span>
                )}

                {iGet && (
                  <span className="text-emerald-700">
                    {fromName} owes you ₹{s.amount}
                  </span>
                )}
              </span>

              {iOwe && (
                <button
                  disabled={balance < s.amount}
                  onClick={() => handlePay(toId, s.amount)}
                  className={`px-3 py-1 rounded text-white text-sm ${
                    balance < s.amount
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  Pay
                </button>
              )}

              {iGet && (
                <button
                  disabled
                  className="bg-white/30 text-gray-500 px-3 py-1 rounded text-sm cursor-not-allowed"
                >
                  Receive
                </button>
              )}
            </div>
          );
        })
      )}

      <div className="mt-4 text-sm text-gray-700">
        Your Wallet Balance: ₹ {balance}
      </div>
    </div>
  );
}
