export   const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
