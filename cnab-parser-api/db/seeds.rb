# Tipo	Descrição	Natureza	Sinal
# 1	Débito	Entrada	+
# 2	Boleto	Saída	-
# 3	Financiamento	Saída	-
# 4	Crédito	Entrada	+
# 5	Recebimento Empréstimo	Entrada	+
# 6	Vendas	Entrada	+
# 7	Recebimento TED	Entrada	+
# 8	Recebimento DOC	Entrada	+
# 9	Aluguel	Saída	-
incoming = Transaction.natures[:incoming]
outcoming = Transaction.natures[:outcoming]

[
  { code: 1, description: 'Débito', nature: incoming },
  { code: 2, description: 'Boleto', nature: outcoming },
  { code: 3, description: 'Financiamento	Saída', nature: outcoming },
  { code: 4, description: 'Crédito	Entrada', nature: incoming },
  { code: 5, description: 'Recebimento Empréstimo', nature: incoming },
  { code: 6, description: 'Vendas', nature: incoming },
  { code: 7, description: 'Recebimento TED', nature: incoming },
  { code: 8, description: 'Recebimento DOC', nature: incoming },
  { code: 9, description: 'Aluguel', nature: outcoming }
].map { |t| Transaction.find_or_create_by!(t) }
