import net from 'net';

// Example printer IP and port (replace with actual)
const PRINTER_IP = '192.168.1.100'; // 🛠 Replace with your printer IP
const PRINTER_PORT = 9100;          // Default for most thermal printers

// Sample KOT content (item name + price)
const kotData = `
--- KOT ---
Item: Chicken Karahi
Price: 850.00 PKR

Item: Naan
Price: 30.00 PKR
`;

// Create TCP socket connection to the printer
const client = new net.Socket();

client.connect(PRINTER_PORT, PRINTER_IP, () => {
  console.log(`✅ Connected to printer at ${PRINTER_IP}:${PRINTER_PORT}`);
  client.write(kotData);     // Send the print data
  client.end();              // Close connection after sending
});

client.on('error', (err) => {
  console.error('❌ Printer connection error:', err.message);
});

client.on('close', () => {
  console.log('🔌 Printer connection closed');
});
