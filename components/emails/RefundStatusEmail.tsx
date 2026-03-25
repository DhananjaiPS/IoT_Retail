import {
  Html, Body, Head, Heading, Text, Container, Section, Hr, Link, Preview,
} from "@react-email/components";

interface RefundEmailProps {
  refundId: string;
  orderId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  amount: string | number;
  remark: string;
}

export const RefundStatusEmail = ({ refundId, orderId, status, amount, remark }: RefundEmailProps) => {
  // Logic to switch colors based on refund decision
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";
  
  const statusColor = isApproved ? "#10b981" : isRejected ? "#f43f5e" : "#f59e0b";
  const statusLabelText = isApproved ? "REFUND PROCESSED" : isRejected ? "REFUND DECLINED" : "REFUND PENDING";

  return (
    <Html>
      <Head />
      <Preview>Refund Update for Order #{orderId.slice(-8)}: {status}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Status Color Strip */}
          <Section style={{ height: "6px", backgroundColor: statusColor, width: "100%" }} />
          
          <Section style={content}>
            <Text style={brand}>Smart Store</Text>
            
            <Heading style={h1}>Refund Update</Heading>
            
            <Section style={statusContainer}>
              <Text style={statusLabel}>{statusLabelText}</Text>
              <Text style={{ ...statusValue, color: statusColor }}>{status}</Text>
              <Text style={amountText}>Amount: ₹{Number(amount).toLocaleString()}</Text>
            </Section>

            <Text style={text}>
              Hello, we have an update regarding your refund request for order <span style={bold}>#{orderId.slice(-8).toUpperCase()}</span>.
              Our accounts team has reviewed your request.
            </Text>

            {/* Decision Remark Card */}
            <Section style={remarkBox}>
              <Text style={remarkTitle}>ADMINISTRATOR REMARK</Text>
              <Text style={remarkContent}>{remark || "No additional comments provided."}</Text>
            </Section>

            {isApproved && (
              <Text style={infoNote}>
                *Note: Approved refunds usually take 5-7 business days to reflect in your original payment method.
              </Text>
            )}

            <Hr style={hr} />

            <Section style={footer}>
              <Text style={footerText}>
                Refund ID: {refundId} • Order ID: {orderId}
              </Text>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={button}>
                View Refund Details
              </Link>
              <Section style={{ marginTop: "24px" }}>
                <Text style={developerTag}>Developed and Maintained By Dhananjai & Team</Text>
              </Section>
            </Section>
            
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// --- STYLES (Optimized for Email Clients) ---

const main = {
  backgroundColor: "#f4f7f9",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  padding: "40px 0",
};

const container = {
  margin: "0 auto",
  width: "560px",
  backgroundColor: "#ffffff",
  borderRadius: "24px",
  overflow: "hidden" as const,
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
};

const content = {
  padding: "40px",
};

const brand = {
  color: "#64748b",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "4px",
  textAlign: "center" as const,
  marginBottom: "32px",
  textTransform: "uppercase" as const,
};

const h1 = {
  color: "#1e293b",
  fontSize: "26px",
  fontWeight: "900",
  textAlign: "center" as const,
  margin: "0 0 40px 0",
  letterSpacing: "-0.5px",
};

const statusContainer = {
  textAlign: "center" as const,
  marginBottom: "35px",
  padding: "20px",
  backgroundColor: "#f8fafc",
  borderRadius: "20px",
};

const statusLabel = {
  fontSize: "10px",
  fontWeight: "800",
  color: "#94a3b8",
  letterSpacing: "1.5px",
  margin: "0",
};

const statusValue = {
  fontSize: "38px",
  fontWeight: "900",
  margin: "4px 0",
  textTransform: "uppercase" as const,
};

const amountText = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#475569",
  margin: "0",
};

const text = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: "24px",
  textAlign: "center" as const,
};

const bold = {
  fontWeight: "700",
  color: "#0f172a",
};

const remarkBox = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  margin: "30px 0",
  border: "1px dashed #cbd5e1",
};

const remarkTitle = {
  fontSize: "9px",
  fontWeight: "900",
  color: "#64748b",
  letterSpacing: "1px",
  margin: "0 0 10px 0",
};

const remarkContent = {
  fontSize: "14px",
  color: "#334155",
  margin: "0",
  lineHeight: "22px",
  fontWeight: "500",
};

const infoNote = {
  fontSize: "12px",
  color: "#94a3b8",
  textAlign: "center" as const,
  fontStyle: "italic",
};

const hr = {
  borderColor: "#f1f5f9",
  margin: "32px 0",
};

const button = {
  backgroundColor: "#0f172a",
  borderRadius: "14px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "18px",
  marginTop: "10px",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  color: "#94a3b8",
  fontSize: "11px",
  marginBottom: "10px",
};

const developerTag = {
  fontSize: "10px",
  color: "#cbd5e1",
  fontWeight: "600",
};