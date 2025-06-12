// src/pages/Verify.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Verify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth.setSession({
        access_token,
        refresh_token,
      }).then(() => {
        // Optional: Add a delay or a success UI
        setTimeout(() => {
          navigate("/auth"); // Redirect to login page
        }, 2000);
      });
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "20vh" }}>
      <h1>Email Verified!</h1>
      <p>Redirecting to sign in page...</p>
    </div>
  );
};

export default Verify;
