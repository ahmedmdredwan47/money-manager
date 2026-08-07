"use client";

import { TransactionWithCategoryAndAccount } from "@/types";

/**
 * Client-side CSV Exporter
 */
export function exportToCSV(filename: string, transactions: TransactionWithCategoryAndAccount[]) {
  if (!transactions || transactions.length === 0) return;

  const headers = ["Date", "Type", "Payee/Merchant", "Category", "Account", "Amount", "Currency", "Description"];

  const rows = transactions.map((t) => [
    t.date,
    t.type,
    `"${(t.payee_merchant || "").replace(/"/g, '""')}"`,
    `"${(t.category?.name || "").replace(/"/g, '""')}"`,
    `"${(t.account?.name || "").replace(/"/g, '""')}"`,
    t.amount,
    t.currency || "BDT",
    `"${(t.description || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Client-side Excel Exporter (TSV format compatible with Excel)
 */
export function exportToExcel(filename: string, transactions: TransactionWithCategoryAndAccount[]) {
  if (!transactions || transactions.length === 0) return;

  const headers = ["Date", "Type", "Payee/Merchant", "Category", "Account", "Amount", "Currency", "Description"];

  const rows = transactions.map((t) => [
    t.date,
    t.type,
    t.payee_merchant || "",
    t.category?.name || "",
    t.account?.name || "",
    t.amount,
    t.currency || "BDT",
    t.description || "",
  ]);

  const tsvContent = "data:application/vnd.ms-excel;charset=utf-8," + [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
  const encodedUri = encodeURI(tsvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * PDF Print Exporter
 */
export function exportToPDF() {
  if (typeof window !== "undefined") {
    window.print();
  }
}
