import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "creator" | "user";

interface UseUserRoleReturn {
  role: AppRole | null;
  roles: AppRole[];
  isAdmin: boolean;
  isCreator: boolean;
  isLoading: boolean;
  userId: string | null;
}

export function useUserRole(): UseUserRoleReturn {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          if (isMounted) {
            setRoles([]);
            setUserId(null);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setUserId(session.user.id);
        }

        const { data: userRoles, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (error) {
          console.error("Error fetching user roles:", error);
          if (isMounted) {
            setRoles([]);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          const fetchedRoles = userRoles?.map(r => r.role as AppRole) || [];
          setRoles(fetchedRoles);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in useUserRole:", error);
        if (isMounted) {
          setRoles([]);
          setIsLoading(false);
        }
      }
    };

    fetchUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setRoles([]);
        setUserId(null);
        setIsLoading(false);
      } else if (session?.user) {
        setUserId(session.user.id);
        // Defer the role fetch to avoid deadlock
        setTimeout(() => {
          fetchUserRole();
        }, 0);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = roles.includes("admin");
  const isCreator = roles.includes("creator") || isAdmin;
  const primaryRole = isAdmin ? "admin" : roles.includes("creator") ? "creator" : roles[0] || null;

  return {
    role: primaryRole,
    roles,
    isAdmin,
    isCreator,
    isLoading,
    userId,
  };
}
