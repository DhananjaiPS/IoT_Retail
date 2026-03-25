import {
  Html, Body, Head, Heading, Text, Container, Section, Hr, Link, Preview,
} from "@react-email/components";

interface EmailProps {
  orderId: string;
  status: string;
  remark: string;
}

export const OrderStatusEmail = ({ orderId, status, remark }: EmailProps) => {
  // Dynamic status colors for a premium touch
  const statusColor = status === "DELIVERED" ? "#10b981" : status === "SHIPPED" ? "#00baf2" : "#f59e0b";

  return (
    <Html>
      <Head />
      <Preview>Your order #{orderId.slice(-8)} status update: {status}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Accent Header Line */}
          <Section style={{ height: "4px", backgroundColor: statusColor, width: "100%" }} />
          
          <Section style={content}>
            <Text style={brand}>Smart Store</Text>
            
            <Heading style={h1}>Order Update</Heading>
            
            <Section style={statusContainer}>
              <Text style={statusLabel}>CURRENT STATUS</Text>
              <Text style={{ ...statusValue, color: statusColor }}>{status}</Text>
            </Section>

            <Text style={text}>
              Hello, your order <span style={bold}>#{orderId.slice(-8).toUpperCase()}</span> has reached a new milestone. 
              Our team has just updated your shipment status.
            </Text>

            {/* Remark Card - Glassy Effect for Email */}
            <Section style={remarkBox}>
              <Text style={remarkTitle}>MESSAGE FROM OUR TEAM</Text>
              <Text style={remarkContent}>{remark}</Text>
            </Section>

            <Hr style={hr} />

            <Section style={footer}>
              <Text style={footerText}>
                Order ID: {orderId} • {new Date().toLocaleDateString()}
              </Text>
              <Link href="#" style={button}>Track Order Progress</Link>
               <Text>Developed and Maintained By Dhananjai & Team</Text>
            </Section>
            
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// --- STYLES (Inline for maximum email compatibility) ---

const main = {
  backgroundColor: "#f9fafb",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  padding: "40px 0",
};

const container = {
  margin: "0 auto",
  width: "560px",
  backgroundColor: "#ffffff",
  borderRadius: "24px",
  overflow: "hidden" as const,
  border: "1px solid #e5e7eb",
  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
};

const content = {
  padding: "40px",
};

const brand = {
  color: "#9ca3af",
  fontSize: "10px",
  fontWeight: "900",
  letterSpacing: "3px",
  textAlign: "center" as const,
  marginBottom: "32px",
};

const h1 = {
  color: "#111827",
  fontSize: "28px",
  fontWeight: "900",
  textAlign: "center" as const,
  margin: "0 0 40px 0",
  letterSpacing: "-0.5px",
};

const statusContainer = {
  textAlign: "center" as const,
  marginBottom: "40px",
};

const statusLabel = {
  fontSize: "10px",
  fontWeight: "800",
  color: "#6b7280",
  letterSpacing: "1px",
  margin: "0",
};

const statusValue = {
  fontSize: "42px",
  fontWeight: "900",
  margin: "4px 0 0 0",
  textTransform: "uppercase" as const,
};

const text = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
  textAlign: "center" as const,
};

const bold = {
  fontWeight: "bold",
  color: "#111827",
};

const remarkBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "16px",
  padding: "24px",
  margin: "32px 0",
  border: "1px solid #f1f5f9",
};

const remarkTitle = {
  fontSize: "9px",
  fontWeight: "900",
  color: "#94a3b8",
  letterSpacing: "1px",
  margin: "0 0 8px 0",
};

const remarkContent = {
  fontSize: "14px",
  color: "#1e293b",
  margin: "0",
  lineHeight: "20px",
};

const hr = {
  borderColor: "#f1f5f9",
  margin: "32px 0",
};

const button = {
  backgroundColor: "#111827",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "16px",
  marginTop: "20px",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
};