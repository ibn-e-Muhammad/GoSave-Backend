/**
 * Test Email Configuration Script
 * Run this to check if Supabase email sending is working
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testEmailConfiguration() {
  console.log("🧪 Testing Supabase Email Configuration");
  console.log("=====================================\n");

  console.log("🔧 Environment Check:");
  console.log(
    `   SUPABASE_URL: ${process.env.SUPABASE_URL ? "✅ Set" : "❌ Missing"}`
  );
  console.log(
    `   SERVICE_KEY: ${
      process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || "development"}\n`);

  // Test 1: Generate email verification link
  console.log("📧 Test 1: Generate Email Link");
  try {
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "signup",
        email: "test@example.com",
        options: {
          redirectTo: "http://localhost:5173/email-verification",
        },
      });

    if (linkError) {
      console.log(`   ❌ Link generation failed: ${linkError.message}`);
    } else {
      console.log("   ✅ Link generated successfully");
      console.log(
        `   🔗 Generated link: ${linkData?.properties?.action_link?.substring(
          0,
          80
        )}...`
      );
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log();

  // Test 2: Test email invitation (this actually sends email)
  console.log("📬 Test 2: Send Email Invitation");
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: inviteData, error: inviteError } =
      await supabase.auth.admin.inviteUserByEmail(testEmail, {
        redirectTo: "http://localhost:5173/email-verification",
      });

    if (inviteError) {
      console.log(`   ❌ Email invitation failed: ${inviteError.message}`);
      console.log("   💡 This might mean SMTP is not configured in Supabase");
    } else {
      console.log("   ✅ Email invitation sent successfully");
      console.log(`   📧 Sent to: ${testEmail}`);
      console.log(
        "   💌 Check the email inbox (if real email) or Supabase logs"
      );
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log();

  // Test 3: Check auth configuration
  console.log("⚙️  Test 3: Check Auth Configuration");
  try {
    // List users to verify admin access
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();

    if (usersError) {
      console.log(`   ❌ Admin access failed: ${usersError.message}`);
    } else {
      console.log(
        `   ✅ Admin access working - found ${users.users?.length || 0} users`
      );
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log();

  // Configuration recommendations
  console.log("💡 Configuration Recommendations:");
  console.log("================================");
  console.log("1. Go to Supabase Dashboard > Authentication > Settings");
  console.log('2. Enable "Confirm email" setting');
  console.log("3. Set Site URL to: http://localhost:5173 (dev) or your domain");
  console.log("4. Optional: Configure SMTP settings for custom emails");
  console.log("5. Test by registering a user in your app");
  console.log();

  console.log("🎯 Next Steps:");
  console.log(
    "1. If emails work: Great! Users will receive verification emails"
  );
  console.log(
    "2. If emails fail: Manual verification will still work as fallback"
  );
  console.log("3. Check Supabase Dashboard > Logs for detailed error messages");
  console.log();

  console.log(
    "✨ Your enhanced auth system supports both email AND manual verification!"
  );
}

// Run test
testEmailConfiguration().catch(console.error);
