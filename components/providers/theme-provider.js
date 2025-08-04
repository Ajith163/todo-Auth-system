"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { createContext, useContext, useEffect, useState } from "react"

const ThemeProvider = ({ children, ...props }) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export { ThemeProvider } 