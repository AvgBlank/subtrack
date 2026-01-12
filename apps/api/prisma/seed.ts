import { PrismaClient, Type, Frequency } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "argon2";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// Test user credentials
const TEST_USER = {
  name: "Rahul Sharma",
  email: "test@example.com",
  password: "Test@1234",
};

// Helper functions
const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomPick = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const randomDate = (year: number, month: number) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = randomBetween(1, daysInMonth);
  return new Date(year, month - 1, day);
};

// Indian Subscriptions (realistic for 50k salary)
const subscriptions = [
  { name: "Netflix Mobile", amount: 149, category: "Entertainment" },
  { name: "Amazon Prime", amount: 299, category: "Entertainment" },
  { name: "Spotify", amount: 119, category: "Entertainment" },
  { name: "YouTube Premium", amount: 129, category: "Entertainment" },
  { name: "JioCinema", amount: 29, category: "Entertainment" },
  { name: "Google One 100GB", amount: 130, category: "Storage" },
];

// Indian Bills (scaled for 50k income)
const bills = [
  { name: "Rent", amount: 12000, category: "Housing" },
  { name: "Electricity Bill", amount: 1200, category: "Utilities" },
  { name: "Piped Gas", amount: 500, category: "Utilities" },
  { name: "Broadband", amount: 599, category: "Utilities" },
  { name: "Mobile Postpaid", amount: 399, category: "Utilities" },
  { name: "Bike EMI", amount: 4500, category: "Transportation" },
];

// Big ticket items that can blow up a month's budget
const bigExpenses = [
  { name: "New Phone - OnePlus", amounts: [25000, 35000, 45000], category: "Electronics" },
  { name: "Laptop Repair/Upgrade", amounts: [8000, 15000, 25000], category: "Electronics" },
  { name: "Wedding Gift - Cousin", amounts: [11000, 21000, 31000], category: "Gifts" },
  { name: "Medical Emergency", amounts: [8000, 15000, 30000, 50000], category: "Healthcare" },
  { name: "Bike Service + Parts", amounts: [5000, 8000, 12000], category: "Transportation" },
  { name: "AC Repair", amounts: [3000, 6000, 10000], category: "Home" },
  { name: "Goa Trip", amounts: [15000, 25000, 35000], category: "Travel" },
  { name: "Family Function Clothes", amounts: [8000, 15000, 25000], category: "Shopping" },
  { name: "Diwali Shopping", amounts: [10000, 20000, 35000], category: "Shopping" },
  { name: "Birthday Party Hosted", amounts: [5000, 10000, 15000], category: "Food" },
  { name: "Home Appliance", amounts: [5000, 12000, 20000], category: "Home" },
  { name: "Concert/Event Tickets", amounts: [3000, 6000, 10000], category: "Entertainment" },
  { name: "Insurance Premium Annual", amounts: [8000, 12000, 18000], category: "Insurance" },
  { name: "Course/Certification", amounts: [5000, 10000, 20000], category: "Education" },
  { name: "Gym Annual Membership", amounts: [8000, 15000, 25000], category: "Fitness" },
  { name: "Dental Treatment", amounts: [5000, 10000, 20000], category: "Healthcare" },
  { name: "Friend's Bachelor Trip", amounts: [10000, 20000, 30000], category: "Travel" },
  { name: "New Helmet + Gear", amounts: [3000, 6000, 10000], category: "Transportation" },
  { name: "Parents Visit Expenses", amounts: [5000, 10000, 15000], category: "Family" },
  { name: "Festival Gifts", amounts: [3000, 5000, 10000], category: "Gifts" },
];

// Regular one-time expenses
const regularExpenses = [
  { name: "Groceries - Zepto", amounts: [400, 700, 1000, 1500], category: "Groceries" },
  { name: "Groceries - Blinkit", amounts: [300, 600, 900, 1200], category: "Groceries" },
  { name: "Groceries - BigBasket", amounts: [800, 1200, 1800, 2500], category: "Groceries" },
  { name: "Vegetables & Fruits", amounts: [300, 500, 800], category: "Groceries" },
  { name: "Swiggy Order", amounts: [150, 250, 400, 600, 800], category: "Food" },
  { name: "Zomato Order", amounts: [200, 350, 500, 800, 1000], category: "Food" },
  { name: "Chai/Coffee Shop", amounts: [50, 100, 150, 200], category: "Food" },
  { name: "Street Food", amounts: [50, 100, 150, 250], category: "Food" },
  { name: "Restaurant Dinner", amounts: [500, 800, 1200, 2000], category: "Food" },
  { name: "Office Lunch", amounts: [100, 150, 200, 250], category: "Food" },
  { name: "Petrol", amounts: [300, 500, 800, 1000], category: "Transportation" },
  { name: "Uber/Ola", amounts: [100, 200, 350, 500], category: "Transportation" },
  { name: "Auto Rickshaw", amounts: [30, 60, 100, 150], category: "Transportation" },
  { name: "Metro Recharge", amounts: [200, 400, 600], category: "Transportation" },
  { name: "Parking", amounts: [50, 100, 200], category: "Transportation" },
  { name: "Movie - PVR", amounts: [250, 400, 600, 800], category: "Entertainment" },
  { name: "Amazon Shopping", amounts: [300, 800, 1500, 2500], category: "Shopping" },
  { name: "Flipkart Order", amounts: [400, 900, 1500, 2000], category: "Shopping" },
  { name: "Myntra - Clothes", amounts: [800, 1500, 2500, 4000], category: "Shopping" },
  { name: "Haircut", amounts: [150, 250, 400], category: "Personal Care" },
  { name: "Medicine - 1mg", amounts: [150, 300, 600, 1000], category: "Healthcare" },
  { name: "Laundry/Dry Clean", amounts: [100, 200, 400], category: "Personal Care" },
  { name: "Mobile Recharge (extra)", amounts: [100, 200, 300], category: "Utilities" },
];

// EXTREME month patterns - INSANE OUTLIERS!
type MonthPattern = {
  spending: number;        // Multiplier for regular expenses
  bigExpenseCount: number; // How many big expenses this month
  extraChaos: number;      // Additional random big purchases
  megaExpense: number;     // One-time MASSIVE expense (in rupees, 0 = none)
  description: string;
};

// 12 months with MASSIVE swings - some huge savings, some disasters!
// Income: ₹85k | Recurring: ~₹22k | Available for one-time: ~₹63k
const monthPatterns: MonthPattern[] = [
  // Month 0 - 🔴🔴 CATASTROPHE: Dad's surgery
  { spending: 0.8, bigExpenseCount: 2, extraChaos: 1, megaExpense: 300000, description: "🏥 DAD'S SURGERY - ₹3L" },
  // Month 1 - 💚💚 EXTREME SAVINGS: Barely spent anything
  { spending: 0.05, bigExpenseCount: 0, extraChaos: 0, megaExpense: 0, description: "💚💚 SUPER SAVER - ₹60k+ saved!" },
  // Month 2 - 💚💚 Still in saving mode
  { spending: 0.08, bigExpenseCount: 0, extraChaos: 0, megaExpense: 0, description: "💚💚 Monk mode continues" },
  // Month 3 - 💚 Good savings month, small splurge
  { spending: 0.4, bigExpenseCount: 1, extraChaos: 0, megaExpense: 0, description: "💚 Disciplined + 1 treat" },
  // Month 4 - 🔴 BIKE DOWN PAYMENT
  { spending: 1.2, bigExpenseCount: 2, extraChaos: 1, megaExpense: 120000, description: "🏍️ BIKE DOWN PAYMENT - ₹1.2L" },
  // Month 5 - 💚💚 Back to extreme saving
  { spending: 0.06, bigExpenseCount: 0, extraChaos: 0, megaExpense: 0, description: "💚💚 EMI started - ultra saving" },
  // Month 6 - 🔴🔴 SISTER'S WEDDING
  { spending: 1.8, bigExpenseCount: 4, extraChaos: 2, megaExpense: 200000, description: "👰 SISTER'S WEDDING - ₹2L" },
  // Month 7 - 💚💚 Post-wedding extreme saving
  { spending: 0.05, bigExpenseCount: 0, extraChaos: 0, megaExpense: 0, description: "💚💚 Wedding recovery - ₹60k saved" },
  // Month 8 - 🔴🔴🔴 DIWALI DISASTER + iPhone
  { spending: 2.5, bigExpenseCount: 5, extraChaos: 3, megaExpense: 160000, description: "🔥🔥 DIWALI + iPhone - ₹1.6L" },
  // Month 9 - 💚 Good recovery month
  { spending: 0.15, bigExpenseCount: 0, extraChaos: 0, megaExpense: 0, description: "💚 Post-Diwali recovery" },
  // Month 10 - 🟡 Moderate - small trip
  { spending: 0.8, bigExpenseCount: 1, extraChaos: 1, megaExpense: 35000, description: "🏖️ Small Goa trip - balanced" },
  // Month 11 (current) - 🟡 Average month
  { spending: 0.5, bigExpenseCount: 1, extraChaos: 0, megaExpense: 0, description: "🎯 Current - on track" },
];

async function main() {
  console.log("🌱 Starting seed with CHAOTIC data...\n");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.savingsGoal.deleteMany();
  await prisma.income.deleteMany();
  await prisma.oneTimeTransaction.deleteMany();
  await prisma.recurringTransactions.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  console.log("\n👤 Creating test user...");
  const hashedPassword = await hash(TEST_USER.password);
  const user = await prisma.user.create({
    data: {
      name: TEST_USER.name,
      email: TEST_USER.email,
      password: hashedPassword,
    },
  });

  // Generate months for past 12 months
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const monthsToGenerate: { month: number; year: number; index: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    monthsToGenerate.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      index: 11 - i,
    });
  }

  // ============================================
  // INCOME - Higher income for better savings potential
  // This is the monthly income that applies every month
  // ============================================
  console.log("\n💰 Creating income sources...");
  
  // Primary salary - ₹72,000/month (Senior Dev)
  await prisma.income.create({
    data: {
      userId: user.id,
      source: "Salary - TechCorp India",
      amount: 72000,
      date: new Date(2024, 0, 1),
      isActive: true,
    },
  });
  console.log("  ✓ Salary - TechCorp India: ₹72,000/month (active)");

  // Side income - ₹13,000/month freelance
  await prisma.income.create({
    data: {
      userId: user.id,
      source: "Freelance - Web Dev",
      amount: 13000,
      date: new Date(2024, 3, 1),
      isActive: true,
    },
  });
  console.log("  ✓ Freelance - Web Dev: ₹13,000/month (active)");

  // Old job (inactive - for history)
  await prisma.income.create({
    data: {
      userId: user.id,
      source: "Previous Job - StartupXYZ",
      amount: 45000,
      date: new Date(2022, 0, 1),
      isActive: false,
    },
  });
  console.log("  ✓ Previous Job - StartupXYZ: ₹45,000/month (inactive)");

  console.log("\n  📊 Total Active Monthly Income: ₹85,000");

  // ============================================
  // SUBSCRIPTIONS
  // ============================================
  console.log("\n📺 Creating subscriptions...");
  
  for (const sub of subscriptions) {
    await prisma.recurringTransactions.create({
      data: {
        userId: user.id,
        name: sub.name,
        amount: sub.amount,
        type: Type.SUBSCRIPTION,
        category: sub.category,
        frequency: Frequency.MONTHLY,
        startDate: new Date(2024, 0, 1),
        isActive: true,
      },
    });
    console.log(`  ✓ ${sub.name}: ₹${sub.amount}/month`);
  }

  // ============================================
  // BILLS
  // ============================================
  console.log("\n📃 Creating bills...");
  
  for (const bill of bills) {
    await prisma.recurringTransactions.create({
      data: {
        userId: user.id,
        name: bill.name,
        amount: bill.amount,
        type: Type.BILL,
        category: bill.category,
        frequency: Frequency.MONTHLY,
        startDate: new Date(2024, 0, 1),
        isActive: true,
      },
    });
    console.log(`  ✓ ${bill.name}: ₹${bill.amount}/month`);
  }

  const totalRecurring = subscriptions.reduce((sum, s) => sum + s.amount, 0) + 
                         bills.reduce((sum, b) => sum + b.amount, 0);
  console.log(`\n  📊 Total Monthly Recurring: ₹${totalRecurring.toLocaleString("en-IN")}`);

  // ============================================
  // ONE-TIME EXPENSES - MAXIMUM CHAOS!
  // ============================================
  console.log("\n💳 Creating one-time expenses with EXTREME volatility...\n");
  
  let totalOneTimeCount = 0;
  const monthlyStats: { month: string; oneTimeTotal: number; pattern: string }[] = [];

  for (const { month, year, index } of monthsToGenerate) {
    const pattern = monthPatterns[index];
    let monthOneTimeTotal = 0;
    const monthLabel = `${year}-${String(month).padStart(2, "0")}`;

    // === MEGA EXPENSE - The outlier creator! ===
    if (pattern.megaExpense > 0) {
      const megaExpenseNames: Record<number, { name: string; category: string }> = {
        300000: { name: "Dad's Surgery - Hospital Bill", category: "Healthcare" },
        200000: { name: "Sister's Wedding - Gifts & Clothes", category: "Gifts" },
        160000: { name: "iPhone 16 Pro Max + AirPods + Case", category: "Electronics" },
        120000: { name: "New Bike Down Payment - RE Hunter", category: "Transportation" },
        35000: { name: "Goa Trip - Flights + Hotel + Fun", category: "Travel" },
      };
      const megaInfo = megaExpenseNames[pattern.megaExpense] || { name: "Major Expense", category: "Other" };
      await prisma.oneTimeTransaction.create({
        data: {
          userId: user.id,
          name: megaInfo.name,
          amount: pattern.megaExpense,
          category: megaInfo.category,
          date: randomDate(year, month),
        },
      });
      monthOneTimeTotal += pattern.megaExpense;
      totalOneTimeCount++;
    }

    // === BIG EXPENSES (main planned/unplanned big purchases) ===
    for (let i = 0; i < pattern.bigExpenseCount; i++) {
      const expense = randomPick(bigExpenses);
      // In high spending months, pick higher amounts more often
      const amounts = expense.amounts;
      const amount = pattern.spending > 2 ? amounts[amounts.length - 1] : randomPick(amounts);
      await prisma.oneTimeTransaction.create({
        data: {
          userId: user.id,
          name: expense.name,
          amount,
          category: expense.category,
          date: randomDate(year, month),
        },
      });
      monthOneTimeTotal += amount;
      totalOneTimeCount++;
    }

    // === EXTRA CHAOS - Random expensive purchases ===
    for (let i = 0; i < pattern.extraChaos; i++) {
      const chaosExpenses = [
        { name: "Impulse Amazon Haul", amount: randomBetween(5000, 15000), category: "Shopping" },
        { name: "Late Night Drunk Shopping", amount: randomBetween(3000, 12000), category: "Shopping" },
        { name: "Treating Friends", amount: randomBetween(2000, 8000), category: "Food" },
        { name: "Fancy Restaurant Splurge", amount: randomBetween(3000, 7000), category: "Food" },
        { name: "Random Gadget Purchase", amount: randomBetween(4000, 15000), category: "Electronics" },
        { name: "Spontaneous Weekend Trip", amount: randomBetween(5000, 20000), category: "Travel" },
        { name: "New Clothes Shopping", amount: randomBetween(3000, 10000), category: "Shopping" },
      ];
      const chaos = randomPick(chaosExpenses);
      await prisma.oneTimeTransaction.create({
        data: {
          userId: user.id,
          name: chaos.name,
          amount: chaos.amount,
          category: chaos.category,
          date: randomDate(year, month),
        },
      });
      monthOneTimeTotal += chaos.amount;
      totalOneTimeCount++;
    }

    // === GROCERIES (scaled heavily - survival mode = 1-2 trips, splurge = 8+ trips) ===
    const groceryCount = Math.max(1, Math.round(5 * pattern.spending));
    for (let i = 0; i < groceryCount; i++) {
      const expense = randomPick(regularExpenses.filter(e => e.category === "Groceries"));
      const amount = Math.round(randomPick(expense.amounts) * (pattern.spending > 1 ? 1.5 : 0.8));
      await prisma.oneTimeTransaction.create({
        data: {
          userId: user.id,
          name: expense.name,
          amount: Math.max(200, amount),
          category: expense.category,
          date: randomDate(year, month),
        },
      });
      monthOneTimeTotal += Math.max(200, amount);
      totalOneTimeCount++;
    }

    // === FOOD DELIVERY (5-15 times per month, heavily scaled) ===
    const foodCount = Math.max(3, Math.round(10 * pattern.spending));
    for (let i = 0; i < foodCount; i++) {
      const expense = randomPick(regularExpenses.filter(e => e.category === "Food"));
      const amount = randomPick(expense.amounts);
      await prisma.oneTimeTransaction.create({
        data: {
          userId: user.id,
          name: expense.name,
          amount,
          category: expense.category,
          date: randomDate(year, month),
        },
      });
      monthOneTimeTotal += amount;
      totalOneTimeCount++;
    }

    // === TRANSPORTATION (3-8 times per month) ===
    const transportCount = Math.max(2, Math.round(5 * pattern.spending));
    for (let i = 0; i < transportCount; i++) {
      const expense = randomPick(regularExpenses.filter(e => e.category === "Transportation"));
      const amount = randomPick(expense.amounts);
      await prisma.oneTimeTransaction.create({
        data: {
          userId: user.id,
          name: expense.name,
          amount,
          category: expense.category,
          date: randomDate(year, month),
        },
      });
      monthOneTimeTotal += amount;
      totalOneTimeCount++;
    }

    // === ENTERTAINMENT (only in higher spending months) ===
    if (pattern.spending > 0.6) {
      const entertainmentCount = Math.round(3 * pattern.spending);
      for (let i = 0; i < entertainmentCount; i++) {
        const expense = randomPick(regularExpenses.filter(e => e.category === "Entertainment"));
        const amount = randomPick(expense.amounts);
        await prisma.oneTimeTransaction.create({
          data: {
            userId: user.id,
            name: expense.name,
            amount,
            category: expense.category,
            date: randomDate(year, month),
          },
        });
        monthOneTimeTotal += amount;
        totalOneTimeCount++;
      }
    }

    // === SHOPPING (only in splurge months) ===
    if (pattern.spending > 1.0) {
      const shoppingCount = Math.round(4 * (pattern.spending - 0.5));
      for (let i = 0; i < shoppingCount; i++) {
        const expense = randomPick(regularExpenses.filter(e => e.category === "Shopping"));
        const amount = randomPick(expense.amounts);
        await prisma.oneTimeTransaction.create({
          data: {
            userId: user.id,
            name: expense.name,
            amount,
            category: expense.category,
            date: randomDate(year, month),
          },
        });
        monthOneTimeTotal += amount;
        totalOneTimeCount++;
      }
    }

    // === PERSONAL CARE (1-2 per month) ===
    if (Math.random() < 0.7) {
      const expense = randomPick(regularExpenses.filter(e => e.category === "Personal Care"));
      const amount = randomPick(expense.amounts);
      await prisma.oneTimeTransaction.create({
        data: {
          userId: user.id,
          name: expense.name,
          amount,
          category: expense.category,
          date: randomDate(year, month),
        },
      });
      monthOneTimeTotal += amount;
      totalOneTimeCount++;
    }

    // === HEALTHCARE (occasional) ===
    if (Math.random() < 0.4) {
      const expense = randomPick(regularExpenses.filter(e => e.category === "Healthcare"));
      const amount = randomPick(expense.amounts);
      await prisma.oneTimeTransaction.create({
        data: {
          userId: user.id,
          name: expense.name,
          amount,
          category: expense.category,
          date: randomDate(year, month),
        },
      });
      monthOneTimeTotal += amount;
      totalOneTimeCount++;
    }

    monthlyStats.push({
      month: monthLabel,
      oneTimeTotal: monthOneTimeTotal,
      pattern: pattern.description,
    });

    // Calculate totals
    const totalExpenses = monthOneTimeTotal + totalRecurring;
    const netCashflow = 85000 - totalExpenses;
    const netEmoji = netCashflow > 40000 ? "💚💚" : netCashflow > 20000 ? "💚" : netCashflow > 0 ? "🟡" : netCashflow > -50000 ? "🟠" : "🔴🔴";

    console.log(
      `  ${monthLabel}: One-time ₹${monthOneTimeTotal.toLocaleString("en-IN").padStart(6)} | ` +
      `Total ₹${totalExpenses.toLocaleString("en-IN").padStart(6)} | ` +
      `Net ${netEmoji} ₹${netCashflow.toLocaleString("en-IN").padStart(7)} | ${pattern.description}`
    );
  }

  console.log(`\n  ✓ Created ${totalOneTimeCount} one-time transactions`);

  // ============================================
  // SAVINGS GOALS (realistic for 53k income)
  // ============================================
  console.log("\n🎯 Creating savings goals...");

  const addMonths = (date: Date, months: number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  };

  const savingsGoals = [
    // ON-TRACK goals
    { name: "Emergency Fund", targetAmount: 100000, currentAmount: 65000, targetDate: addMonths(now, 10) },
    { name: "New Laptop Fund", targetAmount: 60000, currentAmount: 42000, targetDate: addMonths(now, 8) },
    { name: "Bike Upgrade", targetAmount: 40000, currentAmount: 28000, targetDate: addMonths(now, 6) },
    { name: "Investment Corpus", targetAmount: 150000, currentAmount: 90000, targetDate: addMonths(now, 18) },
    // TIGHT goals
    { name: "Goa Trip 2026", targetAmount: 25000, currentAmount: 8000, targetDate: addMonths(now, 5) },
    { name: "New Phone", targetAmount: 35000, currentAmount: 10000, targetDate: addMonths(now, 6) },
    { name: "Home Gym Setup", targetAmount: 30000, currentAmount: 9000, targetDate: addMonths(now, 7) },
    { name: "Wedding Season Fund", targetAmount: 50000, currentAmount: 15000, targetDate: addMonths(now, 8) },
    // AT-RISK goals
    { name: "Sister's Birthday", targetAmount: 15000, currentAmount: 2000, targetDate: addMonths(now, 2) },
    { name: "Course Certification", targetAmount: 20000, currentAmount: 3000, targetDate: addMonths(now, 3) },
    { name: "Gaming Console", targetAmount: 40000, currentAmount: 5000, targetDate: addMonths(now, 4) },
    { name: "Parents Anniversary", targetAmount: 25000, currentAmount: 4000, targetDate: addMonths(now, 3) },
    { name: "Tech Gadgets", targetAmount: 18000, currentAmount: 2500, targetDate: addMonths(now, 2) },
  ];

  for (const goal of savingsGoals) {
    await prisma.savingsGoal.create({
      data: {
        userId: user.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate,
      },
    });
    const progress = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(0);
    console.log(`  ✓ ${goal.name}: ₹${goal.currentAmount.toLocaleString("en-IN")} / ₹${goal.targetAmount.toLocaleString("en-IN")} (${progress}%)`);
  }

  // ============================================
  // SUMMARY
  // ============================================
  const recurringCount = await prisma.recurringTransactions.count();
  const oneTimeCount = await prisma.oneTimeTransaction.count();
  const incomeCount = await prisma.income.count();
  const goalCount = await prisma.savingsGoal.count();

  // Calculate chaos stats
  const oneTimeTotals = monthlyStats.map(m => m.oneTimeTotal);
  const maxOneTime = Math.max(...oneTimeTotals);
  const minOneTime = Math.min(...oneTimeTotals);
  const maxMonth = monthlyStats.find(m => m.oneTimeTotal === maxOneTime)!;
  const minMonth = monthlyStats.find(m => m.oneTimeTotal === minOneTime)!;

  console.log("\n" + "=".repeat(60));
  console.log("✅ SEED COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(60));
  
  console.log("\n📈 Data Summary:");
  console.log(`   Income Sources:         ${incomeCount} (2 active, 1 inactive)`);
  console.log(`   Recurring Transactions: ${recurringCount}`);
  console.log(`   One-Time Transactions:  ${oneTimeCount}`);
  console.log(`   Savings Goals:          ${goalCount}`);
  console.log(`   Total Records:          ${recurringCount + oneTimeCount + incomeCount + goalCount}`);
  
  console.log("\n💰 Monthly Income Breakdown:");
  console.log(`   Salary:    ₹48,000`);
  console.log(`   Freelance: ₹5,000`);
  console.log(`   TOTAL:     ₹53,000/month`);
  
  console.log("\n📊 One-Time Expense Chaos:");
  console.log(`   Highest: ${maxMonth.month} - ₹${maxOneTime.toLocaleString("en-IN")} (${maxMonth.pattern})`);
  console.log(`   Lowest:  ${minMonth.month} - ₹${minOneTime.toLocaleString("en-IN")} (${minMonth.pattern})`);
  console.log(`   Swing:   ₹${(maxOneTime - minOneTime).toLocaleString("en-IN")} difference!`);
  
  console.log("\n" + "=".repeat(60));
  console.log("🔐 TEST USER CREDENTIALS");
  console.log("=".repeat(60));
  console.log(`   Name:     ${TEST_USER.name}`);
  console.log(`   Email:    ${TEST_USER.email}`);
  console.log(`   Password: ${TEST_USER.password}`);
  console.log("=".repeat(60) + "\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
