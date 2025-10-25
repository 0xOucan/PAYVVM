"use client";

import type { NextPage } from "next";
import { StakeFisher } from "~~/components/fishing/StakeFisher";
import { FisherDashboard } from "~~/components/fishing/FisherDashboard";

const FishingPage: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🎣 Fisher Station
          </h1>
          <p className="text-lg opacity-70">
            Stake MATE tokens and run your fisher bot to earn rewards
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="badge badge-primary">Automated Execution</div>
            <div className="badge badge-secondary">Earn Rewards</div>
            <div className="badge badge-accent">Priority Fees</div>
          </div>
        </div>

        {/* Info Alert */}
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
            <div className="font-bold">What is a Fisher?</div>
            <div className="text-xs">
              Fishers monitor the mempool for signed payment messages and execute them on behalf of users.
              They earn MATE rewards plus optional priority fees. Requires staking MATE tokens to participate.
            </div>
          </div>
        </div>

        {/* Staking Section */}
        <div>
          <StakeFisher />
        </div>

        {/* Dashboard Section */}
        <div>
          <FisherDashboard />
        </div>

        {/* How it Works */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title text-lg">How Fisher Execution Works</h3>
            <div className="space-y-2 text-sm">
              <p>
                The EVVM ecosystem uses a signature-based payment system where users sign messages
                instead of sending transactions directly. Fishers execute these signed messages:
              </p>
              <ol className="list-decimal list-inside space-y-2 opacity-80 ml-4">
                <li>
                  <strong>User creates payment:</strong> Signs a payment message with MetaMask (no gas required)
                </li>
                <li>
                  <strong>Message enters mempool:</strong> Pending transaction visible to all fishers
                </li>
                <li>
                  <strong>Fisher validates:</strong> Checks signature, nonce, and balance
                </li>
                <li>
                  <strong>Fisher executes:</strong> Submits transaction on-chain (pays gas)
                </li>
                <li>
                  <strong>Fisher earns:</strong> Receives MATE base reward + priority fee from user
                </li>
              </ol>
              <div className="alert alert-success mt-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs">
                  Stakers earn <strong>doubled MATE rewards</strong> compared to non-stakers!
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title text-lg">Fisher Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-bold mb-2">Prerequisites:</h4>
                <ul className="list-disc list-inside space-y-1 opacity-80">
                  <li>MATE tokens (5,083 MATE = 1 staking token)</li>
                  <li>Sepolia ETH for gas costs</li>
                  <li>Dedicated wallet for fisher bot</li>
                  <li>Server to run fisher bot 24/7</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2">Profitability:</h4>
                <ul className="list-disc list-inside space-y-1 opacity-80">
                  <li>Base MATE rewards per execution</li>
                  <li>Priority fees (user-defined)</li>
                  <li>Doubled rewards for stakers</li>
                  <li>Monitor gas costs vs earnings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://www.evvm.info/docs/ProcessOfATransaction"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            Fisher Documentation
          </a>
          <a
            href="https://www.evvm.info/docs/Staking/Introduction"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            Staking Guide
          </a>
          <a
            href="https://sepolia.etherscan.io/address/0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            Staking Contract
          </a>
        </div>
      </div>
    </div>
  );
};

export default FishingPage;
