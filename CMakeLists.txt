cmake_minimum_required(VERSION 3.10)
project(Quanta)

# ── Standard Settings ────────────────────────────────────────────────────────
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ── LLVM Discovery ───────────────────────────────────────────────────────────
# Priority 1: Use LLVM_DIR if passed from command line (e.g. GitHub Actions)
#             cmake .. -DLLVM_DIR=/path/to/llvm/lib/cmake/llvm
# Priority 2: Find llvm-config on PATH
# Priority 3: macOS Homebrew default paths (works on developer machines)

if(DEFINED LLVM_DIR)
    # When cmake is called with -DLLVM_DIR=..., find_package resolves everything
    find_package(LLVM REQUIRED CONFIG)
    message(STATUS "Found LLVM via LLVM_DIR: ${LLVM_DIR}")
    include_directories(${LLVM_INCLUDE_DIRS})
    add_definitions(${LLVM_DEFINITIONS})
    llvm_map_components_to_libnames(LLVM_LIBS
        core support irreader
        executionengine mcjit orcjit lljit runtimedyld object native
        x86asmparser x86codegen x86desc x86info x86disassembler
        aarch64asmparser aarch64codegen aarch64desc aarch64info aarch64disassembler
        analysis bitwriter passes mcjit
    )
    set(USE_FIND_PACKAGE TRUE)
else()
    # Fallback: use llvm-config executable
    if(APPLE)
        # Try Homebrew Apple Silicon first, then Intel
        if(EXISTS "/opt/homebrew/opt/llvm/bin/llvm-config")
            set(LLVM_CONFIG_EXE "/opt/homebrew/opt/llvm/bin/llvm-config")
            set(LLVM_PREFIX "/opt/homebrew/opt/llvm")
        elseif(EXISTS "/usr/local/opt/llvm/bin/llvm-config")
            set(LLVM_CONFIG_EXE "/usr/local/opt/llvm/bin/llvm-config")
            set(LLVM_PREFIX "/usr/local/opt/llvm")
        endif()
        include_directories(${LLVM_PREFIX}/include)
        link_directories(${LLVM_PREFIX}/lib /opt/homebrew/lib /usr/local/lib)
    else()
        # Linux / Windows: llvm-config should be on PATH
        set(LLVM_CONFIG_EXE "llvm-config")
    endif()

    execute_process(
        COMMAND ${LLVM_CONFIG_EXE} --cxxflags
        OUTPUT_VARIABLE LLVM_CXXFLAGS
        OUTPUT_STRIP_TRAILING_WHITESPACE
    )
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${LLVM_CXXFLAGS}")
endif()

# Windows static linking
if(WIN32)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -static -static-libgcc -static-libstdc++")
endif()

# ── Executable ───────────────────────────────────────────────────────────────
add_executable(quanta
    src/main.cpp
    src/lexer.cpp
    src/parser.cpp
    src/codegen.cpp
    src/quanta_lib.c
)

# ── Linking ──────────────────────────────────────────────────────────────────
if(DEFINED USE_FIND_PACKAGE AND USE_FIND_PACKAGE)
    target_link_libraries(quanta PRIVATE ${LLVM_LIBS})
else()
    if(UNIX AND NOT APPLE)
        # Linux: apt llvm-dev only ships shared libs, so DON'T use --link-static
        execute_process(
            COMMAND ${LLVM_CONFIG_EXE} --libs --system-libs
            OUTPUT_VARIABLE LLVM_LIBS_OUTPUT
            OUTPUT_STRIP_TRAILING_WHITESPACE
        )
    else()
        # Windows / macOS: full LLVM install has static libs
        execute_process(
            COMMAND ${LLVM_CONFIG_EXE} --libs --system-libs --link-static
            OUTPUT_VARIABLE LLVM_LIBS_OUTPUT
            OUTPUT_STRIP_TRAILING_WHITESPACE
        )
    endif()

    string(REPLACE "\n" " " LLVM_LIBS_CLEAN "${LLVM_LIBS_OUTPUT}")
    string(REPLACE " " ";" LLVM_LIBS_LIST "${LLVM_LIBS_CLEAN}")

    if(APPLE)
        target_link_libraries(quanta PRIVATE ${LLVM_LIBS_LIST} z ncurses zstd)
    elseif(WIN32)
        target_link_libraries(quanta PRIVATE ${LLVM_LIBS_LIST} z zstd)
    else()
        target_link_libraries(quanta PRIVATE ${LLVM_LIBS_LIST} z ncurses zstd)
    endif()
endif()