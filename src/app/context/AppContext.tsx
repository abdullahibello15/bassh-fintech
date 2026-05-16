import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export interface UserType {
  id: number;
  _id?: string;
  apiId?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  balance: number;
  status: "Active" | "Suspended";
  joined: string;
  accountType: string;
}

export interface TransactionType {
  id: number;
  userId: number;
  date: string;
  time: string;
  amount: number;
  type: "Deposit" | "Withdrawal" | "Transfer" | "Purchase";
  status: "Completed" | "Pending" | "Failed";
  description: string;
}

export interface WithdrawalType {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  requestDate: string;
  reason?: string;
}

export interface MessageType {
  id: number;
  userId: number;
  user: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: "Pending" | "Replied" | "Resolved";
  date: string;
  time: string;
}

interface AppContextType {
  users: UserType[];
  transactions: TransactionType[];
  withdrawals: WithdrawalType[];
  messages: MessageType[];
  currentUser: UserType | null;
  addUser: (user: Omit<UserType, "id" | "joined">) => UserType;
  upsertUser: (user: UserType) => UserType;
  replaceUsers: (users: UserType[]) => void;
  updateUser: (id: number, updates: Partial<UserType>) => void;
  deleteUser: (id: number) => void;
  setCurrentUser: (user: UserType | null) => void;
  addTransaction: (
    transaction: Omit<TransactionType, "id" | "date" | "time">,
  ) => void;
  addWithdrawal: (
    withdrawal: Omit<WithdrawalType, "id" | "requestDate">,
  ) => void;
  updateWithdrawal: (id: number, status: "Approved" | "Rejected") => void;
  addMessage: (
    message: Omit<MessageType, "id" | "date" | "time" | "status">,
  ) => void;
  updateMessage: (id: number, status: "Replied" | "Resolved") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserType[]>([]);

  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);

  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // ✅ Sync currentUser when users array changes — no infinite loop
  useEffect(() => {
    if (!currentUser) return;

    const updatedUser = users.find(
      (u) =>
        (u.apiId && currentUser.apiId && u.apiId === currentUser.apiId) ||
        u.id === currentUser.id ||
        u.email.toLowerCase() === currentUser.email.toLowerCase(),
    );

    if (!updatedUser) {
      setCurrentUser(null);
      return;
    }

    const hasChanged =
      JSON.stringify(updatedUser) !== JSON.stringify(currentUser);
    if (hasChanged) {
      setCurrentUser(updatedUser);
    }
  }, [users]); // ✅ only users — prevents infinite loop

  const addUser = (userData: Omit<UserType, "id" | "joined">) => {
    const newUser: UserType = {
      ...userData,
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      joined: new Date().toISOString().split("T")[0],
    };
    setUsers([...users, newUser]);
    return newUser;
  };

  const upsertUser = (incomingUser: UserType) => {
    let nextUser = incomingUser;

    setUsers((currentUsers) => {
      const existingUser = currentUsers.find(
        (user) =>
          (user.apiId &&
            incomingUser.apiId &&
            user.apiId === incomingUser.apiId) ||
          (user._id && incomingUser._id && user._id === incomingUser._id) ||
          user.id === incomingUser.id ||
          user.email.toLowerCase() === incomingUser.email.toLowerCase(),
      );

      nextUser = existingUser
        ? {
            ...existingUser,
            ...incomingUser,
            id: existingUser.id,
            apiId: incomingUser.apiId || existingUser.apiId,
            _id: incomingUser._id || existingUser._id,
          }
        : incomingUser;

      return existingUser
        ? currentUsers.map((user) =>
            user.id === existingUser.id ? nextUser : user,
          )
        : [...currentUsers, nextUser];
    });

    setCurrentUser((current) => {
      if (
        !current ||
        ((!current.apiId ||
          !incomingUser.apiId ||
          current.apiId !== incomingUser.apiId) &&
          (!current._id ||
            !incomingUser._id ||
            current._id !== incomingUser._id) &&
          current.id !== incomingUser.id &&
          current.email.toLowerCase() !== incomingUser.email.toLowerCase())
      ) {
        return current;
      }

      return {
        ...current,
        ...incomingUser,
        id: current.id,
        apiId: incomingUser.apiId || current.apiId,
        _id: incomingUser._id || current._id,
      };
    });

    return nextUser;
  };

  const replaceUsers = (nextUsers: UserType[]) => {
    setUsers(nextUsers);
  };

  // ✅ Fixed — matches by apiId and email too
  const updateUser = (id: number, updates: Partial<UserType>) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === id ||
        (updates.apiId && user.apiId === updates.apiId) ||
        (updates.email &&
          user.email.toLowerCase() === updates.email.toLowerCase())
          ? { ...user, ...updates }
          : user,
      ),
    );
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter((user) => user.id !== id));
    setTransactions(transactions.filter((t) => t.userId !== id));
    setWithdrawals(withdrawals.filter((w) => w.userId !== id));
    setMessages(messages.filter((m) => m.userId !== id));
  };

  // ✅ Fixed — single balance field, safe user lookup
  const addTransaction = (
    transactionData: Omit<TransactionType, "id" | "date" | "time">,
  ) => {
    const now = new Date();
    const newTransaction: TransactionType = {
      ...transactionData,
      id: Math.max(...transactions.map((t) => t.id), 0) + 1,
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setTransactions([newTransaction, ...transactions]);

    if (transactionData.status === "Completed") {
      const user = users.find((u) => u.id === transactionData.userId);
      if (user) {
        updateUser(transactionData.userId, {
          balance: (user.balance || 0) + transactionData.amount,
        });
      }
    }
  };

  const addWithdrawal = (
    withdrawalData: Omit<WithdrawalType, "id" | "requestDate">,
  ) => {
    const newWithdrawal: WithdrawalType = {
      ...withdrawalData,
      id: Math.max(...withdrawals.map((w) => w.id), 0) + 1,
      requestDate: new Date().toISOString().split("T")[0],
    };
    setWithdrawals([newWithdrawal, ...withdrawals]);
  };

  // ✅ Fixed — single balance field, early return if not found
  const updateWithdrawal = (id: number, status: "Approved" | "Rejected") => {
    const withdrawal = withdrawals.find((w) => w.id === id);
    if (!withdrawal) return;

    setWithdrawals(
      withdrawals.map((w) => (w.id === id ? { ...w, status } : w)),
    );

    if (status === "Approved") {
      const user = users.find((u) => u.id === withdrawal.userId);
      if (user) {
        updateUser(withdrawal.userId, {
          balance: (user.balance || 0) - withdrawal.amount,
        });

        addTransaction({
          userId: withdrawal.userId,
          amount: -withdrawal.amount,
          type: "Withdrawal",
          status: "Completed",
          description: "Approved Withdrawal Request",
        });
      }
    }
  };

  const addMessage = (
    messageData: Omit<MessageType, "id" | "date" | "time" | "status">,
  ) => {
    const now = new Date();
    const newMessage: MessageType = {
      ...messageData,
      id: Math.max(...messages.map((m) => m.id), 0) + 1,
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "Pending",
    };
    setMessages([newMessage, ...messages]);
  };

  const updateMessage = (id: number, status: "Replied" | "Resolved") => {
    setMessages(messages.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  return (
    <AppContext.Provider
      value={{
        users,
        transactions,
        withdrawals,
        messages,
        currentUser,
        addUser,
        upsertUser,
        replaceUsers,
        updateUser,
        deleteUser,
        setCurrentUser,
        addTransaction,
        addWithdrawal,
        updateWithdrawal,
        addMessage,
        updateMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
