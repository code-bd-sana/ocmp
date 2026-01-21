/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Column } from "./table.types";


type UniversalTableProps<T extends Record<string, any>> = {
  columns: Column<T>[];
  data: T[];
};

const UniversalTable = <T extends Record<string, any>>({
  columns ,
  data,
}: UniversalTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="">
      <div className="mx-auto p-5">
        <div className="flex justify-between items-center mb-4">
          {/* Vehicle List Title */}
          <h1 className="text-3xl font-semibold text-blue-800">Vehicle List</h1>

          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <input
              type="text"
              className="border border-gray-300 rounded-lg px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          {/* Filters Button */}
          <div className="dropdown-container relative">
            <Button
              onClick={() => setShowDropdown(!showDropdown)}
              className="border border-gray-300 px-6 py-2 text-primary bg-white hover:bg-gray-100"
            >
              Filters 
            </Button>
            {showDropdown && (
              <div className="absolute mt-2 right-0 w-48 bg-white border border-gray-300  shadow-lg z-10">
                <ul>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Filter Option 1
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Filter Option 2
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Filter Option 3
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Add Vehicle Button */}
          <Button className="bg-[#044192] text-white px-6 py-2">
            Add Vehicle
          </Button>

          {/* Export Button */}
          <Button className="bg-[#27AE60] text-white px-6 py-2">Export</Button>
        </div>
      </div>

      <div className="overflow-x-auto p-5 bg-[#F9F9FA]">
        <div className="flex items-center  justify-between mb-4">
          <h2 className="text-xl font-semibold">Overview</h2>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="max-w-xs bg-white"
            />
            <Button>View All</Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column.title}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data
              .filter((row) =>
                columns.some((column) =>
                  String(row[column.accessor])
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                ),
              )
              .map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column, index) => (
                    <TableCell key={index}>
                      {String(row[column.accessor])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UniversalTable;
