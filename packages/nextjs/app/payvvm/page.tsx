"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { EvvmDashboard } from "~~/components/payvvm/EvvmDashboard";
import { AccountViewer } from "~~/components/payvvm/AccountViewer";
import { TransactionHistory } from "~~/components/payvvm/TransactionHistory";
import { PyusdTreasury } from "~~/components/payvvm/PyusdTreasury";
import { PyusdPayment } from "~~/components/payvvm/PyusdPayment";
import { MatePayment } from "~~/components/payvvm/MatePayment";
import { MateFaucet } from "~~/components/payvvm/MateFaucet";

const PayvvmExplorerPage: NextPage = () => {
  const [searchAddress, setSearchAddress] = useState<`0x${string}` | undefined>();
  const [searchInput, setSearchInput] = useState<string>("");

  const handleSearch = () => {
    if (searchInput.startsWith('0x') && searchInput.length === 42) {
      setSearchAddress(searchInput as `0x${string}`);
    } else {
      alert('Please enter a valid Ethereum address (0x...)');
    }
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchAddress(undefined);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PAYVVM Explorer
          </h1>
          <p className="text-lg opacity-70">
            Real-time blockchain state viewer for EVVM on Ethereum Sepolia
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="badge badge-primary">No Indexer Needed</div>
            <div className="badge badge-secondary">Direct RPC</div>
            <div className="badge badge-accent">Real-time Data</div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <div className="font-bold">EVVM Contract</div>
            <div className="text-xs">
              <code>0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e</code>
            </div>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText('0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e')}
            className="btn btn-sm btn-ghost"
          >
            📋
          </button>
        </div>

        {/* EVVM System Dashboard */}
        <div>
          <EvvmDashboard />
        </div>

        {/* PYUSD Treasury - Deposit & Withdraw */}
        <div>
          <PyusdTreasury />
        </div>

        {/* PYUSD Payment - Send to Others */}
        <div>
          <PyusdPayment />
        </div>

        {/* MATE Faucet - Claim Tokens */}
        <div>
          <MateFaucet />
        </div>

        {/* MATE Payment - Send MATE to Others */}
        <div>
          <MatePayment />
        </div>

        {/* Account Search */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Search Account</h2>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Enter Ethereum address to view account state</span>
                <span className="label-text-alt text-xs opacity-60">
                  Or connect your wallet above
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0x..."
                  className="input input-bordered flex-1"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSearch}
                  disabled={!searchInput}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  Search
                </button>
                {searchAddress && (
                  <button
                    className="btn btn-ghost"
                    onClick={handleClear}
                  >
                    Clear
                  </button>
                )}
              </div>
              <label className="label">
                <span className="label-text-alt">
                  Example: 0x9c77c6fafc1eb0821f1de12972ef0199c97c6e45
                </span>
              </label>
            </div>

            {/* Quick Search Links */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm opacity-70">Quick search:</span>
              <button
                className="btn btn-xs btn-outline"
                onClick={() => {
                  setSearchInput('0x9c77c6fafc1eb0821f1de12972ef0199c97c6e45');
                  setSearchAddress('0x9c77c6fafc1eb0821f1de12972ef0199c97c6e45');
                }}
              >
                Deployer
              </button>
              <button
                className="btn btn-xs btn-outline"
                onClick={() => {
                  setSearchInput('0x93d2c57690DB077e5d0B3112F1B255C6CB39Ac99');
                  setSearchAddress('0x93d2c57690DB077e5d0B3112F1B255C6CB39Ac99');
                }}
              >
                Admin
              </button>
              <button
                className="btn btn-xs btn-outline"
                onClick={() => {
                  setSearchInput('0x121c631B7aEa24316bD90B22C989Ca008a84E5Ed');
                  setSearchAddress('0x121c631B7aEa24316bD90B22C989Ca008a84E5Ed');
                }}
              >
                Golden Fisher
              </button>
            </div>
          </div>
        </div>

        {/* Account Viewer */}
        <div>
          <AccountViewer address={searchAddress} />
        </div>

        {/* Transaction History */}
        <div>
          <TransactionHistory address={searchAddress} limit={20} />
        </div>

        {/* Info Section */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title text-lg">How it works</h3>
            <div className="space-y-2 text-sm">
              <p>
                This explorer uses a hybrid approach for maximum performance:
              </p>
              <ul className="list-disc list-inside space-y-1 opacity-80">
                <li><strong>Real-time state:</strong> Direct RPC queries using wagmi/viem hooks</li>
                <li><strong>Transaction history:</strong> HyperSync (2000x faster than RPC!)</li>
                <li>No events needed - works perfectly with PAYVVM's architecture</li>
                <li>No database or indexer infrastructure required</li>
                <li>Click refresh buttons to update data on demand</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://sepolia.etherscan.io/address/0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            View EVVM on Etherscan
          </a>
          <a
            href="https://www.evvm.info"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            EVVM Documentation
          </a>
        </div>
      </div>
    </div>
  );
};

export default PayvvmExplorerPage;
