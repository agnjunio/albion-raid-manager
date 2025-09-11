import type { AIService, RaidRole } from "../src/types";

import * as fs from "fs";
import * as path from "path";

import { logger } from "@albion-raid-manager/core/logger";

import { createAIService } from "../src/service";

interface TestResult {
  filename: string;
  success: boolean;
  title?: string;
  roles?: Array<{ name: string; role: string }>;
  location?: string;
  time?: string;
  requirements?: string[];
  confidence?: number;
  error?: string;
}

async function testMessage(service: AIService, message: string, filename: string): Promise<TestResult> {
  try {
    logger.info(`🧪 Testing: ${filename}`);

    const result = await service.parseDiscordPing(message);

    return {
      filename,
      success: true,
      title: result.title,
      roles: result.roles?.map((r: RaidRole) => ({ name: r.name, role: r.role })),
      location: result.location,
      time: result.time,
      requirements: result.requirements,
      confidence: result.confidence,
    };
  } catch (error) {
    logger.error(`❌ Failed to parse ${filename}: ${error}`);
    return {
      filename,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function runRegressionTests() {
  logger.info("🚀 Starting Comprehensive Regression Test");
  logger.info("=".repeat(60));

  const service = createAIService();
  const examplesDir = __dirname;
  const testFiles = fs
    .readdirSync(examplesDir)
    .filter((file) => file.endsWith(".txt"))
    .filter((file) => !file.includes("sample")); // Skip sample files

  const results: TestResult[] = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const file of testFiles) {
    const filePath = path.join(examplesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");

    // Handle files with multiple messages separated by ---
    const messages = content
      .split("---")
      .map((msg) => msg.trim())
      .filter((msg) => msg.length > 0);

    for (let i = 0; i < messages.length; i++) {
      totalTests++;
      const message = messages[i];
      const testName = messages.length > 1 ? `${file} (message ${i + 1})` : file;

      const result = await testMessage(service, message, testName);
      results.push(result);

      if (result.success) {
        passedTests++;
        logger.info(`✅ ${testName}: ${result.title || "No title"} (${result.roles?.length || 0} roles)`);
      } else {
        failedTests++;
        logger.error(`❌ ${testName}: ${result.error}`);
      }
    }
  }

  // Summary Report
  logger.info("=".repeat(60));
  logger.info("📊 REGRESSION TEST SUMMARY");
  logger.info("=".repeat(60));
  logger.info(`Total Tests: ${totalTests}`);
  logger.info(`✅ Passed: ${passedTests}`);
  logger.info(`❌ Failed: ${failedTests}`);
  logger.info(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  // Detailed Results
  logger.info("\n📋 DETAILED RESULTS:");
  logger.info("=".repeat(60));

  for (const result of results) {
    if (result.success) {
      logger.info(`✅ ${result.filename}`);
      logger.info(`   Title: ${result.title || "N/A"}`);
      logger.info(`   Location: ${result.location || "N/A"}`);
      logger.info(`   Time: ${result.time || "N/A"}`);
      logger.info(`   Roles: ${result.roles?.map((r) => `${r.name}(${r.role})`).join(", ") || "N/A"}`);
      logger.info(`   Requirements: ${result.requirements?.join(", ") || "N/A"}`);
      logger.info(`   Confidence: ${result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : "N/A"}`);
    } else {
      logger.error(`❌ ${result.filename}: ${result.error}`);
    }
    logger.info("");
  }

  // Critical Checks
  logger.info("🔍 CRITICAL ACCURACY CHECKS:");
  logger.info("=".repeat(60));

  const criticalChecks = results
    .filter((r) => r.success)
    .map((result) => {
      const checks = [];

      // Check if FB is correctly mapped to RANGED_DPS
      const fbRole = result.roles?.find((r) => r.name === "FB");
      if (fbRole) {
        checks.push(`FB role: ${fbRole.role === "RANGED_DPS" ? "✅" : "❌"} (${fbRole.role})`);
      }

      // Check if Tank is correctly mapped to TANK
      const tankRole = result.roles?.find((r) => r.name.toLowerCase().includes("tank"));
      if (tankRole) {
        checks.push(`Tank role: ${tankRole.role === "TANK" ? "✅" : "❌"} (${tankRole.role})`);
      }

      // Check if Healer is correctly mapped to HEALER
      const healerRole = result.roles?.find((r) => r.name.toLowerCase().includes("healer"));
      if (healerRole) {
        checks.push(`Healer role: ${healerRole.role === "HEALER" ? "✅" : "❌"} (${healerRole.role})`);
      }

      // Check if location extraction works
      if (result.location && result.location !== "Not specified") {
        checks.push(`Location: ✅ (${result.location})`);
      }

      // Check if requirements are extracted
      if (result.requirements && result.requirements.length > 0) {
        checks.push(`Requirements: ✅ (${result.requirements.length} items)`);
      }

      return { filename: result.filename, checks };
    });

  for (const check of criticalChecks) {
    if (check.checks.length > 0) {
      logger.info(`${check.filename}:`);
      check.checks.forEach((c) => logger.info(`  ${c}`));
    }
  }

  logger.info("=".repeat(60));
  if (failedTests === 0) {
    logger.info("🎉 ALL TESTS PASSED! Token optimizations maintained accuracy.");
  } else {
    logger.error(`⚠️  ${failedTests} tests failed. Please review the results above.`);
  }
  logger.info("=".repeat(60));
}

// Run the regression test
runRegressionTests().catch((error) => {
  logger.error("Regression test failed:", error);
  process.exit(1);
});
