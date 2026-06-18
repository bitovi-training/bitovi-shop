import './Toast.css';

export default function Toast({ children, className = '', ...props }) {
  return (
    <div className={`toast ${className}`.trim()} role="status" {...props}>
      {children}
    </div>
  );
}