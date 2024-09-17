import React, { ReactNode, createContext, useContext, useMemo, useState } from 'react'

interface CompanyContextProps {
  CompanyId: string | undefined
  AccountingTools: number | undefined
  setCompanyId: (value: string) => void
  setAccountingToolType: (value: number) => void
}

const CompanyContext = createContext<CompanyContextProps | undefined>(undefined)

export const CompanyContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [CompanyId, setInternalCompanyId] = useState<string | undefined>('7')
  const [AccountingTools, setInternalAccountingTools] = useState<number | undefined>()

  const setCompanyId = (value: string) => {
    setInternalCompanyId(value)
  }

  const setAccountingToolType = (value: number) => {
    setInternalAccountingTools(value)
  }

  const value = useMemo(
    () => ({
      CompanyId,
      AccountingTools,
      setCompanyId,
      setAccountingToolType,
    }),
    [CompanyId, AccountingTools, setCompanyId, setAccountingToolType]
  )

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
}

export const useCompanyContext = (): CompanyContextProps => {
  const context = useContext(CompanyContext)
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}
