/**
 * Test Enhanced Auth System
 * Comprehensive test of the new registration and verification system
 */

require("dotenv").config();
const express = require("express");

async function testEnhancedAuthSystem() {
  console.log("🧪 Testing Enhanced Auth System");
  console.log("================================\n");

  // Test 1: Environment check
  console.log("1. Environment Variables:");
  const requiredEnvVars = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_ANON_KEY",
  ];

  let envOk = true;
  requiredEnvVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ ${varName}: MISSING`);
      envOk = false;
    }
  });

  if (!envOk) {
    console.log("\n❌ Environment setup incomplete. Please check .env file.");
    return;
  }

  // Test 2: Route loading
  console.log("\n2. Enhanced Auth Route:");
  try {
    const authRoute = require("./routes/api/v1/auth-enhanced.js");
    console.log("   ✅ Enhanced auth route loaded successfully");
  } catch (error) {
    console.log(`   ❌ Failed to load route: ${error.message}`);
    return;
  }

  // Test 3: Supabase connection
  console.log("\n3. Supabase Connection:");
  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from("users")
      .select("count(*)")
      .limit(1);

    if (error) {
      console.log(`   ❌ Supabase connection failed: ${error.message}`);
    } else {
      console.log("   ✅ Supabase connection successful");
    }
  } catch (error) {
    console.log(`   ❌ Supabase test failed: ${error.message}`);
  }

  // Test 4: Create test app
  console.log("\n4. Express App Setup:");
  try {
    const app = express();
    app.use(express.json());

    // Load routes
    const authEnhancedRoutes = require("./routes/api/v1/auth-enhanced.js");
    app.use("/api/v1/auth-enhanced", authEnhancedRoutes);

    console.log("   ✅ Express app configured successfully");

    // Test server startup
    const server = app.listen(5001, () => {
      console.log("   ✅ Test server started on port 5001");
    });

    // Wait a moment then test endpoints
    setTimeout(async () => {
      console.log("\n5. API Endpoint Tests:");

      // Test registration endpoint
      try {
        const testUser = {
          email: `test-${Date.now()}@example.com`,
          password: "TestPassword123!",
          full_name: "Test User",
          phone: "+1234567890",
        };

        const fetch = require("node-fetch");
        const response = await fetch(
          "http://localhost:5001/api/v1/auth-enhanced/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUser),
          }
        );

        const result = await response.json();

        if (result.success) {
          console.log("   ✅ Registration endpoint working");
          console.log(`   📧 User created: ${testUser.email}`);

          if (result.development) {
            console.log("   🔧 Development verification URLs available");
            console.log(
              `   🔗 Manual: ${result.development.manualVerificationUrl}`
            );
            console.log(
              `   👤 Admin: ${result.development.adminVerificationUrl}`
            );
          }
        } else {
          console.log(`   ❌ Registration failed: ${result.error}`);
        }
      } catch (error) {
        console.log(`   ❌ API test failed: ${error.message}`);
      }

      // Cleanup
      server.close();
      console.log("\n✅ Enhanced Auth System Test Complete!");
    }, 1000);
  } catch (error) {
    console.log(`   ❌ Express setup failed: ${error.message}`);
  }
}

// Run test if called directly
if (require.main === module) {
  testEnhancedAuthSystem().catch(console.error);
}

module.exports = { testEnhancedAuthSystem };
