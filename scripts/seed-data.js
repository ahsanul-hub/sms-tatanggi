const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log("Starting data seeding...");

    // Create sample clients
    const clients = [
      {
        name: "John Doe",
        email: "john@company1.com",
        companyName: "PT. Company One",
        phoneNumber: "+6281234567890",
        address: "Jakarta, Indonesia",
      },
      {
        name: "Jane Smith",
        email: "jane@company2.com",
        companyName: "CV. Company Two",
        phoneNumber: "+6281234567891",
        address: "Surabaya, Indonesia",
      },
      {
        name: "Bob Johnson",
        email: "bob@company3.com",
        companyName: "PT. Company Three",
        phoneNumber: "+6281234567892",
        address: "Bandung, Indonesia",
      },
    ];

    for (const clientData of clients) {
      // Check if client already exists
      const existingClient = await prisma.user.findUnique({
        where: { email: clientData.email },
      });

      if (existingClient) {
        console.log(`Client ${clientData.email} already exists, skipping...`);
        continue;
      }

      // Create client
      const hashedPassword = await bcrypt.hash("password123", 12);

      const client = await prisma.user.create({
        data: {
          name: clientData.name,
          email: clientData.email,
          password: hashedPassword,
          role: "CLIENT",
          clientProfile: {
            create: {
              companyName: clientData.companyName,
              phoneNumber: clientData.phoneNumber,
              address: clientData.address,
              balance: Math.floor(Math.random() * 1000000) + 100000, // Random balance 100k-1M
              isActive: true,
            },
          },
        },
      });

      console.log(
        `Created client: ${clientData.companyName} (${clientData.email})`
      );

      // Create sample transactions
      const transactionCount = Math.floor(Math.random() * 10) + 5;
      for (let i = 0; i < transactionCount; i++) {
        const amount = Math.floor(Math.random() * 500000) + 50000;
        const type = Math.random() > 0.5 ? "PAYMENT" : "DEBIT";
        const status = Math.random() > 0.2 ? "COMPLETED" : "PENDING";

        await prisma.transaction.create({
          data: {
            userId: client.id,
            amount: type === "DEBIT" ? -amount : amount,
            type,
            status,
            description:
              type === "PAYMENT"
                ? `Top up saldo sebesar Rp ${amount.toLocaleString("id-ID")}`
                : `Tagihan SMS ${Math.floor(amount / 500)} pesan`,
            referenceId: `${type}_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
          },
        });
      }

      // Create sample SMS logs
      const smsCount = Math.floor(Math.random() * 50) + 10;
      for (let i = 0; i < smsCount; i++) {
        const phoneNumber = `+628${Math.floor(Math.random() * 1000000000)
          .toString()
          .padStart(9, "0")}`;
        const status = Math.random() > 0.1 ? "SENT" : "FAILED";

        await prisma.smsLog.create({
          data: {
            userId: client.id,
            phoneNumber,
            message: `Test SMS ${i + 1} - ${new Date().toLocaleString(
              "id-ID"
            )} - ${clientData.companyName}`,
            status,
            cost: 500,
            sentAt: status === "SENT" ? new Date() : null,
          },
        });
      }

      console.log(
        `Created ${transactionCount} transactions and ${smsCount} SMS logs for ${clientData.companyName}`
      );
    }

    console.log("Data seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
