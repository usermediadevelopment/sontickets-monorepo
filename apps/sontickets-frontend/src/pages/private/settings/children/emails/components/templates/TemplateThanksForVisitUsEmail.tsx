import { Container, Img, Link, Section, Text } from '@react-email/components';

interface EmailProps {
  logoUrl: string;
  headerTitle: string;
  headerSubtitle: string;
  footer1: FooterProps;
  lang: 'es' | 'en';
}

const TemplateThanksForVisitUsEmail = ({
  logoUrl,
  headerTitle,
  headerSubtitle,
  footer1,
}: EmailProps) => {
  return (
    <Container style={container}>
      <Section>
        <Img
          style={{
            margin: '0 auto',
          }}
          src={logoUrl}
          width='80'
          alt='Logo'
        />
      </Section>
      <Section>
        <Text style={text}>{headerTitle ?? 'Hola {name}'}</Text>
        <Text style={text}>{headerSubtitle}</Text>

        <Footer {...footer1} />
      </Section>
    </Container>
  );
};

type FooterProps = {
  value?: string;
  url?: string;
  urlTitle?: string;
};
const Footer = ({ value, url, urlTitle }: FooterProps) => {
  return (
    <Text style={text}>
      {value}
      {url && (
        <Link target='_blank' href={url}>
          {' ' + urlTitle}
        </Link>
      )}
    </Text>
  );
};

export default TemplateThanksForVisitUsEmail;

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '30px',
  margin: '0 auto',
  width: '100%',
};

const text = {
  fontSize: '14px',
  fontWeight: '300',
  color: '#404040',

  padding: '0px 16px',
};
