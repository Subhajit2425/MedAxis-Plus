import {
  Container,
  Typography,
  Box,
  Divider,
  Paper
} from "@mui/material";

export default function PrivacyPolicy() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: { xs: 3, md: 5 } }}>
        {/* Title */}
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Privacy Policy
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Intro */}
        <Typography variant="body1" paragraph>
          Welcome to <strong>MedAxis+</strong>. Your privacy is extremely
          important to us. This Privacy Policy explains how we collect, use,
          protect, and handle your personal information when you use our
          platform.
        </Typography>

        {/* Section 1 */}
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            1. Information We Collect
          </Typography>

          <Typography variant="body1" paragraph>
            We collect only the information necessary to provide our services
            effectively and securely.
          </Typography>

          <Typography variant="subtitle1" fontWeight={600}>
            Personal Information
          </Typography>
          <Typography variant="body2" paragraph>
            • Name <br />
            • Email address <br />
            • Mobile number <br />
            • Date of birth (for identity verification)
          </Typography>

          <Typography variant="subtitle1" fontWeight={600}>
            Doctor Information
          </Typography>
          <Typography variant="body2" paragraph>
            • Professional details (specialization, experience) <br />
            • Practice or clinic address <br />
            • Consultation fees
          </Typography>
        </Box>

        {/* Section 2 */}
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            2. How We Use Your Information
          </Typography>

          <Typography variant="body2" paragraph>
            Your information is used strictly for legitimate purposes, including:
          </Typography>

          <Typography variant="body2" paragraph>
            • Creating and managing user accounts <br />
            • Booking and managing appointments <br />
            • Verifying doctor profiles for authenticity <br />
            • Improving platform performance and user experience <br />
            • Communicating important updates
          </Typography>
        </Box>

        {/* Section 3 */}
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            3. Doctor Verification & Admin Review
          </Typography>

          <Typography variant="body2" paragraph>
            Doctor registrations go through a manual verification process by an
            administrator. Approval or rejection is based on submitted
            information to ensure platform safety and trust.
          </Typography>
        </Box>

        {/* Section 4 */}
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            4. Data Security
          </Typography>

          <Typography variant="body2" paragraph>
            We use industry-standard security practices to protect your data.
            Access to sensitive information is restricted and monitored.
            However, no digital system is completely secure, and we continuously
            improve our safeguards.
          </Typography>
        </Box>

        {/* Section 5 */}
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            5. Cookies & Local Storage
          </Typography>

          <Typography variant="body2" paragraph>
            We may use cookies or local storage to maintain login sessions and
            improve platform usability. These are not used for cross-site
            tracking.
          </Typography>
        </Box>

        {/* Section 6 */}
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            6. Data Sharing
          </Typography>

          <Typography variant="body2" paragraph>
            We do not sell or rent your personal data. Information may only be
            shared when required by law or to protect user safety and platform
            integrity.
          </Typography>
        </Box>

        {/* Section 7 */}
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            7. Your Rights
          </Typography>

          <Typography variant="body2" paragraph>
            You have the right to access, correct, or request deletion of your
            personal data, subject to legal and operational requirements.
          </Typography>
        </Box>

        {/* Section 8 */}
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            8. Children’s Privacy
          </Typography>

          <Typography variant="body2" paragraph>
            MedAxis+ is not intended for children under the age of 13. We do not
            knowingly collect data from minors.
          </Typography>
        </Box>

        {/* Section 9 */}
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            9. Changes to This Policy
          </Typography>

          <Typography variant="body2" paragraph>
            We may update this Privacy Policy periodically. Any changes will be
            reflected on this page with an updated date.
          </Typography>
        </Box>

        {/* Section 10 */}
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            10. Contact Us
          </Typography>

          <Typography variant="body2">
            If you have any questions or concerns about this Privacy Policy,
            please contact us:
            <br /><br />
            📧 <strong>Email:</strong> support@medaxis.com
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
        >
          © {new Date().getFullYear()} MedAxis+. All rights reserved.
        </Typography>
      </Paper>
    </Container>
  );
}
