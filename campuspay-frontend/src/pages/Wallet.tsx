import Wallet from "../components/Wallet";

export default function WalletPage() {
  return (
    <div className="px-8 py-8 max-w-4xl mx-auto fade-in">
      <h1 className="text-4xl font-extrabold mb-8 brand-text">
        💳 Wallet
      </h1>

      <Wallet />
    </div>
  );
}
