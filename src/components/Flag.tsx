import ReactCountryFlag from 'react-country-flag';

interface Props {
  code: string;
  size?: number;
  className?: string;
}

export default function Flag({ code, size = 18, className = '' }: Props) {
  return (
    <ReactCountryFlag
      countryCode={code}
      svg
      style={{ width: 'auto', height: size, borderRadius: 2, verticalAlign: 'middle' }}
      title={code}
      className={className}
    />
  );
}
