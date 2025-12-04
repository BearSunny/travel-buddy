.global _Test
.section 
_Test:
# %rdi: Arg 1
# %rsi: Arg 2
    movl $1, %eax ; result
    testl %esi, %esi ; if (p != 0)
.Loop:
    jz .End 
    testl $1, %esi  ; if (p & 0x1)
    jz .EndIf:
    imull %edi, %eax ; result *= x
.EndIf:
    imull %edi, %edi 
    shrl $1, %esi
    jmp .Loop
.End:
    ret

