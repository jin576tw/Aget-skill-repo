#!/bin/bash
# Hook: UserPromptSubmit
# Detects session-end keywords and injects @memory reminder into Claude's context.
# Fires while conversation context is still available.

prompt=$(cat | jq -r '.prompt // ""' 2>/dev/null || echo "")

if echo "$prompt" | grep -qE '收工|結束|close session|end session'; then
  printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"[Auto Hook] Session end keyword detected. You MUST call @memory agent to update P:\\\\MEMORY\\\\journal\\\\pos-ui.md before responding. Show Memory has updated! when done."}}\n'
fi

exit 0
