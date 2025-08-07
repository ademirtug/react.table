import { useContext, createContext } from "react";


export const DataContext = createContext();

export const useTable = () => useContext(DataContext);