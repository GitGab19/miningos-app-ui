import Modal from 'antd/es/modal'
import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const StyledModal = styled(Modal)`
  .ant-modal-content {
    background-color: ${COLOR.SIMPLE_BLACK};
  }

  .ant-modal-header {
    background-color: ${COLOR.SIMPLE_BLACK};
    border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
  }

  .ant-modal-title {
    color: ${COLOR.WHITE};
  }
`

export const ModalBody = styled.div`
  ${flexColumn};
  gap: 24px;
  padding-top: 16px;
`

export const Section = styled.div`
  ${flexColumn};
  gap: 16px;
`

export const SectionTitle = styled.h4`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${COLOR.GRAY};
  margin: 0;
`

export const FormField = styled.div`
  ${flexColumn};
  gap: 8px;
`

export const FieldLabel = styled.label`
  font-size: 13px;
  color: ${COLOR.WHITE};
`

export const FieldHint = styled.span`
  font-size: 11px;
  color: ${COLOR.GRAY};
`

export const FieldRow = styled.div`
  ${flexRow};
  gap: 12px;

  > * {
    flex: 1;
  }
`

export const PresetCard = styled.div<{ $selected?: boolean }>`
  ${flexColumn};
  gap: 8px;
  padding: 12px;
  border: 1px solid ${({ $selected }) => ($selected ? COLOR.BLUE : COLOR.WHITE_ALPHA_01)};
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: ${COLOR.BLUE};
  }
`

export const PresetName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${COLOR.WHITE};
`

export const PresetDetails = styled.span`
  font-size: 12px;
  color: ${COLOR.GRAY};
  font-family: monospace;
`

export const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`

export const FormActions = styled.div`
  ${flexRow};
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const LogsContainer = styled.div`
  background-color: ${COLOR.EBONY};
  border-radius: 4px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 11px;
  color: ${COLOR.GRAY};
  white-space: pre-wrap;
  word-break: break-all;
`
