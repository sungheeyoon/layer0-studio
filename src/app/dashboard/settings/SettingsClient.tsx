'use client';

import React, { useState, useTransition } from "react";
import { changePasswordAction, deleteAccountAction } from "./actions";
import { logoutAction } from "@/app/login/actions";
import { useDashboardData } from "../DashboardDataProvider";

export default function SettingsClient() {
  const { user } = useDashboardData();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (password !== confirmPassword) {
      setPasswordError("PASSWORDS_DO_NOT_MATCH");
      return;
    }

    if (password.length < 6) {
      setPasswordError("WEAK_PASSWORD");
      return;
    }

    startTransition(async () => {
      const result = await changePasswordAction(password);
      if (result.error) {
        setPasswordError(result.error);
      } else {
        setPasswordSuccess(true);
        setIsChangingPassword(false);
        setPassword("");
        setConfirmPassword("");
      }
    });
  };

  const handleLogout = async () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const handleDeleteAccount = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }

    startTransition(async () => {
      const result = await deleteAccountAction();
      if (result?.error) {
        setDeleteError('계정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
        setIsConfirmingDelete(false);
      }
    });
  };

  const userName = user?.user_metadata?.full_name || "SYSTEM_USER";
  const userEmail = user?.email || "UNKNOWN@LAYER0.STUDIO";
  const userId = user?.id.substring(0, 8).toUpperCase() || "SYS_UID: 000-000";

  return (
    <>
      {/* Header Section */}
      <section className="mb-16 grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8">
          <h2 className="text-[3.5rem] font-[100] tracking-[0.02em] leading-none mb-4 text-primary">SETTINGS</h2>
          <div className="flex items-center">
            <div className="w-1 h-1 bg-tertiary mr-3"></div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-outline">LAYER0_STUDIO_ENV_CORE</p>
          </div>
        </div>
      </section>

      {/* Technical Blocks */}
      <div className="grid grid-cols-12 gap-y-24 gap-x-12">
        {/* 1. ACCOUNT_INFO */}
        <section className="col-span-12 md:col-span-6">
          <div className="mb-8 flex items-baseline justify-between border-b border-outline-variant pb-2">
            <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-primary">01 // ACCOUNT_INFO</h3>
            <span className="text-[0.6rem] font-light text-outline">SYS_UID: {userId}</span>
          </div>
          
          <div className="space-y-10">
            <div className="relative group">
              <label className="block text-[0.6rem] font-medium uppercase tracking-[0.1em] text-outline mb-1">NAME</label>
              <div className="flex items-center border-b border-outline-variant py-2 focus-within:border-primary transition-colors">
                <span className="text-[0.875rem] font-light flex-grow">{userName}</span>
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-[0.6rem] font-medium uppercase tracking-[0.1em] text-outline mb-1">EMAIL</label>
              <div className="flex items-center border-b border-outline-variant py-2 focus-within:border-primary transition-colors">
                <span className="text-[0.875rem] font-light flex-grow">{userEmail}</span>
              </div>
            </div>
            
            <div className="pt-4">
              {!isChangingPassword ? (
                <div>
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="group flex items-center text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-primary"
                  >
                    <span className="border-b border-primary pb-0.5">CHANGE_PASSWORD_PROTOCOL</span>
                    <span className="material-symbols-outlined ml-2 text-[1rem]">lock_reset</span>
                  </button>
                  {passwordSuccess && (
                    <p className="mt-2 text-[0.6rem] text-primary uppercase tracking-widest">PASSWORD_UPDATED_SUCCESSFULLY</p>
                  )}
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-6 bg-surface-container-low p-6 border border-outline-variant">
                  <div className="space-y-2">
                    <label className="block text-[0.6rem] font-medium uppercase tracking-[0.1em] text-outline">NEW_PASSWORD</label>
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-2 text-[0.875rem] font-light focus:ring-0 focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[0.6rem] font-medium uppercase tracking-[0.1em] text-outline">CONFIRM_NEW_PASSWORD</label>
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-2 text-[0.875rem] font-light focus:ring-0 focus:border-primary"
                      required
                    />
                  </div>
                  
                  {passwordError && (
                    <p className="text-[0.6rem] text-tertiary uppercase tracking-widest">ERROR: {passwordError}</p>
                  )}
                  
                  <div className="flex space-x-4">
                    <button 
                      type="submit"
                      disabled={isPending}
                      className="flex-grow bg-primary text-on-primary py-3 text-[0.6rem] font-medium uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isPending ? "PROCESSING..." : "EXECUTE_UPDATE"}
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordError(null);
                      }}
                      className="px-6 border border-outline text-outline py-3 text-[0.6rem] font-medium uppercase tracking-[0.2em] hover:bg-surface-container transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* 2. BILLING_PLAN */}
        <section className="col-span-12 md:col-span-5 md:col-start-8">
          <div className="mb-8 flex items-baseline justify-between border-b border-outline-variant pb-2">
            <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-primary">02 // BILLING_PLAN</h3>
            <span className="text-[0.6rem] font-light text-outline">STATUS: ACTIVE</span>
          </div>
          
          <div className="bg-surface-container-low p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
              <span className="material-symbols-outlined text-[6rem]">terminal</span>
            </div>
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.1em] text-outline mb-2">CURRENT_NODE</p>
            <p className="text-2xl font-light tracking-widest mb-6">PROFESSIONAL_NODE</p>
            
            <div className="flex justify-between items-center mb-10">
              <div>
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.1em] text-outline">NEXT_RENEWAL</p>
                <p className="text-[0.875rem] font-light uppercase">2024_OCT_24</p>
              </div>
              <div className="text-right">
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.1em] text-outline">CYCLE</p>
                <p className="text-[0.875rem] font-light uppercase">ANNUAL</p>
              </div>
            </div>
            
            <button className="w-full bg-primary text-on-primary py-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] hover:opacity-90 transition-opacity">
              UPGRADE_PLAN
            </button>
          </div>
        </section>

        {/* 3. ACCOUNT_ACTIONS */}
        <section className="col-span-12 md:col-span-5 md:col-start-8">
          <div className="mb-8 flex items-baseline justify-between border-b border-outline-variant pb-2">
            <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-primary">03 // ACCOUNT_ACTIONS</h3>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleLogout}
              disabled={isPending}
              className="w-full group flex items-center justify-between border border-outline px-6 py-4 hover:bg-black hover:text-white transition-all dark:hover:bg-white dark:hover:text-black disabled:opacity-50"
            >
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.1em]">TERMINATE_SESSION</span>
              <span className="material-symbols-outlined">logout</span>
            </button>
            
            <div className="space-y-2">
              <button 
                onClick={handleDeleteAccount}
                disabled={isPending}
                className={`w-full group flex items-center justify-between border px-6 py-4 transition-all ${
                  isConfirmingDelete 
                  ? "bg-tertiary text-on-tertiary border-tertiary" 
                  : "border-outline-variant hover:border-tertiary"
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-1 h-1 mr-4 ${isConfirmingDelete ? "bg-on-tertiary" : "bg-tertiary"}`}></div>
                  <span className={`text-[0.6875rem] font-medium uppercase tracking-[0.1em] ${isConfirmingDelete ? "" : "text-tertiary"}`}>
                    {isConfirmingDelete ? "CONFIRM_SYSTEM_PURGE" : "PERMANENT_DELETION"}
                  </span>
                </div>
                <span className="material-symbols-outlined">delete_forever</span>
              </button>
              
              {isConfirmingDelete && (
                <button 
                  onClick={() => setIsConfirmingDelete(false)}
                  className="w-full text-center py-2 text-[0.6rem] font-medium uppercase tracking-[0.1em] text-outline hover:text-primary transition-colors"
                >
                  CANCEL_DELETION_PROTOCOL
                </button>
              )}
            </div>
          </div>
          
          {deleteError && (
            <p className="mt-4 text-[0.6rem] text-tertiary uppercase tracking-widest">{deleteError}</p>
          )}

          <div className="mt-10">
            <p className="text-[0.6rem] font-light text-outline leading-relaxed">
              WARNING: PERMANENT_DELETION IS IRREVERSIBLE. ALL ARCHIVAL DATA AND LOGICAL NODES WILL BE PURGED FROM THE SYSTEM CORES.
            </p>
          </div>
        </section>
      </div>

      {/* System Footer Metadata */}
      <footer className="mt-32 pt-8 border-t border-surface-container grid grid-cols-12 gap-6">
        <div className="col-span-12 flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-outline">LAYER0_STUDIO // CORE_OS</p>
            <p className="text-[0.6rem] font-light text-outline">BUILD_REV: 0x8892-ALPHA</p>
          </div>
          <div className="flex items-center space-x-8 text-[0.6rem] font-medium uppercase tracking-[0.1em] text-outline">
            <span>DOCS_REF</span>
            <span>API_STATUS_OK</span>
            <span>2024 © ARCHITECT_PROTOCOL</span>
          </div>
        </div>
      </footer>
    </>
  );
}
