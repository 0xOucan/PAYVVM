"use client";

import type { NextPage } from "next";
import { PyusdFaucet } from "~~/components/payvvm/PyusdFaucet";
import { MateFaucetService } from "~~/components/payvvm/MateFaucetService";

const FaucetsPage: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">EVVM Faucets</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Claim free testnet tokens for PAYVVM testing
          </p>
          <p className="text-sm mt-2 text-gray-500">
            Gasless claiming powered by EIP-191 signatures and the Fisher Network
          </p>
        </div>

        {/* Info Alert */}
        <div className="alert alert-info mb-6 shadow-lg">
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
          <div className="text-sm">
            <div className="font-bold mb-1">How gasless faucets work:</div>
            <ol className="list-decimal list-inside space-y-1">
              <li>Sign a claim message with your wallet (no gas required)</li>
              <li>Signature automatically submits to the fishing pool API</li>
              <li>Fisher bot polls the API and executes your claim transaction</li>
              <li>Tokens are sent directly to your EVVM balance</li>
              <li>24-hour cooldown between claims</li>
            </ol>
          </div>
        </div>

        {/* Faucets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* PYUSD Faucet */}
          <div>
            <PyusdFaucet />
          </div>

          {/* MATE Faucet */}
          <div>
            <MateFaucetService />
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* PYUSD Info Card */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">PYUSD Faucet</h3>
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-bold">Contract:</span>{" "}
                  <a
                    href="https://sepolia.etherscan.io/address/0x74F7A28aF1241cfBeC7c6DBf5e585Afc18832a9a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary font-mono text-xs"
                  >
                    0x74F7...2a9a
                  </a>
                </div>
                <div>
                  <span className="font-bold">Claim Amount:</span> 1 PYUSD
                </div>
                <div>
                  <span className="font-bold">Cooldown:</span> 24 hours
                </div>
                <div>
                  <span className="font-bold">Token:</span> PYUSD (6 decimals)
                </div>
                <div>
                  <span className="font-bold">Network:</span> Ethereum Sepolia
                </div>
                <div>
                  <span className="font-bold">Use Case:</span> Test PYUSD payments, treasury deposits/withdrawals
                </div>
              </div>
            </div>
          </div>

          {/* MATE Info Card */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">MATE Faucet</h3>
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-bold">Contract:</span>{" "}
                  <a
                    href="https://sepolia.etherscan.io/address/0x068E9091e430786133439258C4BeeD696939405e"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary font-mono text-xs"
                  >
                    0x068E...405e
                  </a>
                </div>
                <div>
                  <span className="font-bold">Claim Amount:</span> 510 MATE
                </div>
                <div>
                  <span className="font-bold">Cooldown:</span> 24 hours
                </div>
                <div>
                  <span className="font-bold">Token:</span> MATE (18 decimals, Protocol Token)
                </div>
                <div>
                  <span className="font-bold">Network:</span> Ethereum Sepolia
                </div>
                <div>
                  <span className="font-bold">Use Case:</span> Username registration (500 MATE), priority fees,
                  staking
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fisher Network Info */}
        <div className="card bg-base-300 shadow-xl mb-8">
          <div className="card-body">
            <h3 className="card-title text-xl mb-4">About the Fisher Network</h3>
            <div className="text-sm space-y-3">
              <p>
                The Fisher Network enables gasless transactions on EVVM. Fishers are network participants who execute
                transactions on behalf of users, eliminating the need for users to hold ETH for gas fees.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-bold mb-2">For Users:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>No ETH required for gas</li>
                    <li>Just sign messages with your wallet</li>
                    <li>Transactions executed automatically</li>
                    <li>Complete abstraction of blockchain complexity</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">For Fishers:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Earn MATE rewards for executing transactions</li>
                    <li>Optional priority fees from users</li>
                    <li>Requires MATE token staking</li>
                    <li>Monitor fishing pool via API</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <a href="/fishing" className="link link-primary">
                  Learn more about becoming a Fisher →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-xl mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title font-medium">Why do I need these tokens?</div>
                <div className="collapse-content text-sm">
                  <p>
                    PYUSD is used for testing payment functionalities on PAYVVM. MATE is the protocol token used for
                    username registration (500 MATE), paying priority fees, and staking to become a Fisher.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title font-medium">Do I need ETH to claim from faucets?</div>
                <div className="collapse-content text-sm">
                  <p>
                    No! The faucets use gasless claiming via EIP-191 signatures. You only sign a message (no gas
                    required), and a Fisher executes the transaction for you.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title font-medium">How often can I claim?</div>
                <div className="collapse-content text-sm">
                  <p>You can claim from each faucet once every 24 hours. The cooldown is tracked per wallet address.</p>
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title font-medium">Where do the tokens go?</div>
                <div className="collapse-content text-sm">
                  <p>
                    Tokens are sent directly to your EVVM balance (not your wallet). You can view your EVVM balance on
                    the <a href="/payvvm" className="link link-primary">PAYVVM page</a>.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title font-medium">What if the faucet is empty?</div>
                <div className="collapse-content text-sm">
                  <p>
                    If a faucet has insufficient balance, the claim button will be disabled. Please contact the
                    administrators or wait for the faucet to be refilled.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title font-medium">Can I claim on mainnet?</div>
                <div className="collapse-content text-sm">
                  <p>
                    No, these are testnet-only faucets running on Ethereum Sepolia. They distribute test tokens with no
                    real value.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaucetsPage;
