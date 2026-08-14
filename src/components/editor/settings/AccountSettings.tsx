"use client";

import {
  User,
  Building2,
  Cloud,
  HardDrive,
  CreditCard,
  Globe,
} from "lucide-react";

import { useEditorSettings } from "../EditorSettingsContext";

export default function AccountSettings() {

  const {
    settings,
    updateAccount,
  } = useEditorSettings();

  const account = settings.account;

  return (

    <div className="p-8 space-y-10">

      {/* Heading */}

      <div>

        <h2 className="text-2xl font-bold">

          Account Settings

        </h2>

        <p className="text-sm opacity-70 mt-2">

          Manage your profile and cloud workspace.

        </p>

      </div>

      {/* Profile */}

      <div className="rounded-xl border p-6">

        <div className="flex items-center gap-2 mb-6">

          <User size={20} />

          <h3 className="font-semibold">

            Profile

          </h3>

        </div>

        <div className="grid grid-cols-2 gap-5">

          <input
            value={account.fullName}
            onChange={(e)=>
              updateAccount({
                fullName:e.target.value
              })
            }
            placeholder="Full Name"
            className="border rounded-xl p-3"
          />

          <input
            value={account.email}
            onChange={(e)=>
              updateAccount({
                email:e.target.value
              })
            }
            placeholder="Email"
            className="border rounded-xl p-3"
          />

          <input
            value={account.company}
            onChange={(e)=>
              updateAccount({
                company:e.target.value
              })
            }
            placeholder="Company"
            className="border rounded-xl p-3"
          />

          <input
            value={account.role}
            onChange={(e)=>
              updateAccount({
                role:e.target.value
              })
            }
            placeholder="Role"
            className="border rounded-xl p-3"
          />

        </div>

      </div>

      {/* Workspace */}

      <div className="rounded-xl border p-6">

        <div className="flex items-center gap-2 mb-6">

          <Building2 size={20}/>

          <h3 className="font-semibold">

            Workspace

          </h3>

        </div>

        <input
          value={account.workspaceName}
          onChange={(e)=>
            updateAccount({
              workspaceName:e.target.value
            })
          }
          className="border rounded-xl p-3 w-full"
        />

      </div>

      {/* Cloud */}

      <div className="rounded-xl border p-6">

        <div className="flex items-center gap-2 mb-6">

          <Cloud size={20}/>

          <h3 className="font-semibold">

            Cloud Sync

          </h3>

        </div>

        <label className="flex justify-between">

          Enable Cloud Sync

          <input
            type="checkbox"
            checked={account.cloudSync}
            onChange={(e)=>
              updateAccount({
                cloudSync:e.target.checked
              })
            }
          />

        </label>

        <label className="flex justify-between mt-5">

          Automatic Backup

          <input
            type="checkbox"
            checked={account.autoBackup}
            onChange={(e)=>
              updateAccount({
                autoBackup:e.target.checked
              })
            }
          />

        </label>

      </div>

      {/* Subscription */}

      <div className="rounded-xl border p-6">

        <div className="flex items-center gap-2 mb-6">

          <CreditCard size={20}/>

          <h3 className="font-semibold">

            Subscription

          </h3>

        </div>

        <select
          value={account.subscription}
          onChange={(e)=>
            updateAccount({
              subscription:e.target.value as any
            })
          }
          className="border rounded-xl p-3 w-60"
        >

          <option>Free</option>

          <option>Pro</option>

          <option>Enterprise</option>

        </select>

      </div>

      {/* Storage */}

      <div className="rounded-xl border p-6">

        <div className="flex items-center gap-2 mb-6">

          <HardDrive size={20}/>

          <h3 className="font-semibold">

            Storage

          </h3>

        </div>

        <p>

          {account.storageUsed} GB / {account.storageLimit} GB

        </p>

        <div className="w-full bg-gray-200 rounded-full h-3 mt-4">

          <div
            className="bg-blue-600 h-3 rounded-full"
            style={{
              width: `${(account.storageUsed /
                account.storageLimit) * 100}%`,
            }}
          />

        </div>

      </div>

      {/* Website */}

      <div className="rounded-xl border p-6">

        <div className="flex items-center gap-2 mb-6">

          <Globe size={20}/>

          <h3 className="font-semibold">

            Website

          </h3>

        </div>

        <input
          value={account.website}
          onChange={(e)=>
            updateAccount({
              website:e.target.value
            })
          }
          placeholder="https://"
          className="border rounded-xl p-3 w-full"
        />

      </div>

    </div>

  );

}