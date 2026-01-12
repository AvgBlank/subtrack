import { PrismaClient, Type, Frequency } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { hash } from "argon2";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// Helper to generate random date within range
const randomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
};

// Helper to pick random item from array
const randomPick = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random decimal
const randomDecimal = (min: number, max: number) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// Categories for transactions
const expenseCategories = [
  "Housing",
  "Utilities",
  "Groceries",
  "Transportation",
  "Healthcare",
  "Insurance",
  "Entertainment",
  "Dining",
  "Shopping",
  "Education",
  "Fitness",
  "Personal Care",
  "Subscriptions",
  "Travel",
  "Gifts",
  "Pets",
  "Home Maintenance",
  "Clothing",
  "Electronics",
  "Other",
];

const subscriptionNames = [
  "Netflix",
  "Spotify",
  "Amazon Prime",
  "Disney+",
  "HBO Max",
  "YouTube Premium",
  "Apple Music",
  "Hulu",
  "Adobe Creative Cloud",
  "Microsoft 365",
  "Dropbox",
  "iCloud Storage",
  "Google One",
  "Notion",
  "Figma",
  "GitHub Pro",
  "LinkedIn Premium",
  "Audible",
  "Kindle Unlimited",
  "PlayStation Plus",
  "Xbox Game Pass",
  "Nintendo Switch Online",
  "Paramount+",
  "Peacock",
  "Crunchyroll",
  "NordVPN",
  "1Password",
  "Grammarly",
  "Canva Pro",
  "Slack",
];

const billNames = [
  "Electricity Bill",
  "Water Bill",
  "Gas Bill",
  "Internet",
  "Phone Bill",
  "Rent",
  "Mortgage",
  "Car Insurance",
  "Health Insurance",
  "Life Insurance",
  "Home Insurance",
  "Car Payment",
  "Student Loan",
  "Credit Card Payment",
  "Gym Membership",
  "HOA Fees",
  "Property Tax",
  "Trash Collection",
  "Lawn Care",
  "Security System",
];

const oneTimeExpenses = [
  "New Laptop",
  "Phone Repair",
  "Car Maintenance",
  "Doctor Visit",
  "Dentist Appointment",
  "Concert Tickets",
  "Flight Tickets",
  "Hotel Booking",
  "Birthday Gift",
  "Wedding Gift",
  "Home Repair",
  "Furniture",
  "New Tires",
  "Glasses",
  "Prescription Medicine",
  "Vet Visit",
  "Restaurant Dinner",
  "Groceries",
  "Gas Station",
  "Parking Fee",
  "Taxi/Uber",
  "Movie Tickets",
  "Books",
  "Online Course",
  "Gym Equipment",
  "Kitchen Appliance",
  "Garden Supplies",
  "Office Supplies",
  "Haircut",
  "Spa Treatment",
];

const incomeSources = [
  "Salary",
  "Freelance Work",
  "Consulting",
  "Bonus",
  "Commission",
  "Dividends",
  "Interest",
  "Rental Income",
  "Side Project",
  "Stock Sale",
  "Tax Refund",
  "Gift",
  "Reimbursement",
  "Cashback",
  "Overtime Pay",
];

const savingsGoalNames = [
  "Emergency Fund",
  "Vacation to Japan",
  "New Car",
  "House Down Payment",
  "Wedding Fund",
  "Retirement",
  "Kids Education",
  "Home Renovation",
  "New MacBook",
  "Investment Portfolio",
  "Debt Payoff",
  "Christmas Fund",
  "Medical Fund",
  "Moving Fund",
  "Business Startup",
];

// User data
const users = [
  { name: "John Doe", email: "john@example.com", password: "password123" },
  { name: "Jane Smith", email: "jane@example.com", password: "password123" },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.savingsGoal.deleteMany();
  await prisma.income.deleteMany();
  await prisma.oneTimeTransaction.deleteMany();
  await prisma.recurringTransactions.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log("👤 Creating users...");
  const createdUsers = [];
  for (const userData of users) {
    const hashedPassword = await hash(userData.password);
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      },
    });
    createdUsers.push(user);
    console.log(`  ✓ Created user: ${user.name}`);
  }

  // Create data for each user
  for (const user of createdUsers) {
    console.log(`\n📊 Creating data for ${user.name}...`);

    // Create recurring transactions (subscriptions)
    const numSubscriptions = Math.floor(Math.random() * 8) + 5; // 5-12 subscriptions
    console.log(`  📺 Creating ${numSubscriptions} subscriptions...`);
    for (let i = 0; i < numSubscriptions; i++) {
      await prisma.recurringTransactions.create({
        data: {
          userId: user.id,
          name: randomPick(subscriptionNames),
          amount: randomDecimal(4.99, 29.99),
          type: Type.SUBSCRIPTION,
          category: "Subscriptions",
          frequency: randomPick([Frequency.MONTHLY, Frequency.YEARLY]),
          startDate: randomDate(new Date("2024-01-01"), new Date("2025-12-01")),
          isActive: Math.random() > 0.2, // 80% are active
        },
      });
    }

    // Create recurring transactions (bills)
    const numBills = Math.floor(Math.random() * 6) + 4; // 4-9 bills
    console.log(`  📃 Creating ${numBills} bills...`);
    for (let i = 0; i < numBills; i++) {
      const billName = randomPick(billNames);
      let amount: number;
      // Set realistic amounts based on bill type
      if (billName.includes("Rent") || billName.includes("Mortgage")) {
        amount = randomDecimal(800, 2500);
      } else if (billName.includes("Insurance")) {
        amount = randomDecimal(50, 300);
      } else if (
        billName.includes("Car Payment") ||
        billName.includes("Student Loan")
      ) {
        amount = randomDecimal(200, 600);
      } else {
        amount = randomDecimal(30, 200);
      }

      await prisma.recurringTransactions.create({
        data: {
          userId: user.id,
          name: billName,
          amount,
          type: Type.BILL,
          category: randomPick([
            "Housing",
            "Utilities",
            "Insurance",
            "Transportation",
            "Healthcare",
          ]),
          frequency: randomPick([
            Frequency.MONTHLY,
            Frequency.WEEKLY,
            Frequency.YEARLY,
          ]),
          startDate: randomDate(new Date("2023-01-01"), new Date("2025-06-01")),
          isActive: Math.random() > 0.1, // 90% are active
        },
      });
    }

    // Create one-time transactions (last 12 months)
    // Jane gets more transactions in Jan 2026
    const isJane = user.email === "jane@example.com";
    const numOneTime = isJane ? 60 : Math.floor(Math.random() * 50) + 30; // Jane gets 60, others get 30-79
    console.log(`  💳 Creating ${numOneTime} one-time transactions...`);
    for (let i = 0; i < numOneTime; i++) {
      const expenseName = randomPick(oneTimeExpenses);
      let amount: number;
      // Set realistic amounts based on expense type
      if (expenseName.includes("Laptop") || expenseName.includes("Furniture")) {
        amount = randomDecimal(500, 2000);
      } else if (
        expenseName.includes("Flight") ||
        expenseName.includes("Hotel")
      ) {
        amount = randomDecimal(200, 800);
      } else if (expenseName.includes("Gift")) {
        amount = randomDecimal(30, 200);
      } else if (expenseName.includes("Groceries")) {
        amount = randomDecimal(50, 200);
      } else if (expenseName.includes("Gas")) {
        amount = randomDecimal(30, 80);
      } else {
        amount = randomDecimal(10, 150);
      }

      // Jane gets most transactions in Jan 2026
      const transactionDate = isJane && i < 45
        ? randomDate(new Date("2026-01-01"), new Date("2026-01-12"))
        : randomDate(new Date("2025-01-01"), new Date("2026-01-12"));

      await prisma.oneTimeTransaction.create({
        data: {
          userId: user.id,
          name: expenseName,
          amount,
          category: randomPick(expenseCategories),
          date: transactionDate,
        },
      });
    }

    // Create income records (last 12 months)
    const numIncomes = Math.floor(Math.random() * 15) + 10; // 10-24 income records
    console.log(`  💰 Creating ${numIncomes} income records...`);
    for (let i = 0; i < numIncomes; i++) {
      const source = randomPick(incomeSources);
      let amount: number;
      // Set realistic amounts based on income type
      if (source === "Salary") {
        amount = randomDecimal(3000, 8000);
      } else if (source === "Bonus" || source === "Stock Sale") {
        amount = randomDecimal(1000, 10000);
      } else if (source === "Rental Income") {
        amount = randomDecimal(800, 2500);
      } else if (source === "Dividends" || source === "Interest") {
        amount = randomDecimal(50, 500);
      } else if (source === "Freelance Work" || source === "Consulting") {
        amount = randomDecimal(500, 3000);
      } else {
        amount = randomDecimal(50, 1000);
      }

      await prisma.income.create({
        data: {
          userId: user.id,
          source,
          amount,
          date: randomDate(new Date("2025-01-01"), new Date("2026-01-12")),
        },
      });
    }

    // Create savings goals
    const numGoals = Math.floor(Math.random() * 4) + 2; // 2-5 savings goals
    console.log(`  🎯 Creating ${numGoals} savings goals...`);
    const usedGoals = new Set<string>();
    for (let i = 0; i < numGoals; i++) {
      let goalName = randomPick(savingsGoalNames);
      // Ensure unique goals per user
      while (usedGoals.has(goalName)) {
        goalName = randomPick(savingsGoalNames);
      }
      usedGoals.add(goalName);

      let targetAmount: number;
      // Set realistic target amounts based on goal type
      if (goalName.includes("House") || goalName.includes("Retirement")) {
        targetAmount = randomDecimal(50000, 200000);
      } else if (goalName.includes("Car") || goalName.includes("Wedding")) {
        targetAmount = randomDecimal(15000, 40000);
      } else if (
        goalName.includes("Vacation") ||
        goalName.includes("Renovation")
      ) {
        targetAmount = randomDecimal(3000, 15000);
      } else if (goalName.includes("MacBook") || goalName.includes("Fund")) {
        targetAmount = randomDecimal(1000, 10000);
      } else {
        targetAmount = randomDecimal(500, 5000);
      }

      // Current amount is 0-90% of target
      const currentAmount = randomDecimal(0, targetAmount * 0.9);
      // Monthly contribution is 1-5% of target amount
      const monthlyContribution = randomDecimal(targetAmount * 0.01, targetAmount * 0.05);

      await prisma.savingsGoal.create({
        data: {
          userId: user.id,
          name: goalName,
          targetAmount,
          currentAmount,
          monthlyContribution,
          targetDate: randomDate(
            new Date("2026-06-01"),
            new Date("2030-12-31"),
          ),
        },
      });
    }
  }

  // Print summary
  const userCount = await prisma.user.count();
  const recurringCount = await prisma.recurringTransactions.count();
  const oneTimeCount = await prisma.oneTimeTransaction.count();
  const incomeCount = await prisma.income.count();
  const goalCount = await prisma.savingsGoal.count();

  console.log("\n✅ Seed completed!");
  console.log("📈 Summary:");
  console.log(`   Users: ${userCount}`);
  console.log(`   Recurring Transactions: ${recurringCount}`);
  console.log(`   One-Time Transactions: ${oneTimeCount}`);
  console.log(`   Income Records: ${incomeCount}`);
  console.log(`   Savings Goals: ${goalCount}`);
  console.log(
    `   Total Records: ${userCount + recurringCount + oneTimeCount + incomeCount + goalCount}`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
