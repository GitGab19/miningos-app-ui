import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

interface StyledProps {
  $color?: string
  $running?: boolean
  $expanded?: boolean
}

export const TranslatorCard = styled.div<StyledProps>`
  ${flexColumn};
  gap: 16px;
  padding: 16px;
  background-color: ${COLOR.EBONY};
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  border-radius: 8px;
`

export const Header = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const HeaderLeft = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  gap: 12px;
`

export const Icon = styled.span<StyledProps>`
  font-size: 20px;
`

export const Title = styled.span<StyledProps>`
  font-weight: 600;
  font-size: 14px;
  color: ${COLOR.WHITE};
`

export const Description = styled.p<StyledProps>`
  font-size: 13px;
  color: ${COLOR.GRAY};
  margin: 0;
  line-height: 1.5;
`

export const StatusRow = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  gap: 8px;
`

export const StatusDot = styled.span<StyledProps>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $running }) => ($running ? COLOR.GREEN : COLOR.GRAY)};
`

export const StatusText = styled.span<StyledProps>`
  font-size: 13px;
  color: ${({ $running }) => ($running ? COLOR.GREEN : COLOR.GRAY)};
`

export const ConfigSection = styled.div<StyledProps>`
  ${flexColumn};
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
  display: ${({ $expanded }) => ($expanded ? 'flex' : 'none')};
`

export const ConfigRow = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
  align-items: center;
`

export const ConfigLabel = styled.span<StyledProps>`
  font-size: 12px;
  color: ${COLOR.GRAY};
`

export const ConfigValue = styled.span<StyledProps>`
  font-size: 12px;
  color: ${COLOR.WHITE};
  font-family: monospace;
`

export const ButtonRow = styled.div<StyledProps>`
  ${flexRow};
  gap: 8px;
  margin-top: 4px;
`

export const ExpandButton = styled.button<StyledProps>`
  background: none;
  border: none;
  color: ${COLOR.BLUE};
  font-size: 12px;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`

export const ErrorText = styled.span<StyledProps>`
  font-size: 12px;
  color: ${COLOR.RED};
`

export const PortBadge = styled.span<StyledProps>`
  font-size: 11px;
  padding: 2px 6px;
  background-color: ${COLOR.WHITE_ALPHA_01};
  border-radius: 4px;
  font-family: monospace;
  color: ${COLOR.WHITE};
`
